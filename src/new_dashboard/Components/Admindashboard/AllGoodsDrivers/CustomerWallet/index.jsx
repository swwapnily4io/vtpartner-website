/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
// CustomerWalletDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import {
  serverEndPoint,
  RAZORPAY_KEY_ID,
  formatEpoch,
} from "../../../../../dashboard/app/constants";
import Loader from "../../../Loader";

const CustomerWalletDetails = () => {
  const { customerId, customerName } = useParams();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [directModal, setDirectModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [directAmount, setDirectAmount] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [directBtnLoading, setDirectBtnLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const token = Cookies.get("authToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const fetchWalletDetails = async () => {
    try {
      const response = await axios.post(
        `${serverEndPoint}/get_customer_wallet_balance`,
        { customer_id: customerId },
        config
      );
      setWallet(response.data.wallet);

      // Also fetch transactions
      await fetchTransactions();
    } catch (error) {
      toast.error("Failed to fetch wallet details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.post(
        `${serverEndPoint}/get_customer_wallet_transactions`,
        { customer_id: customerId },
        config
      );
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [customerId]);

  const handlePayment = async () => {
    setBtnLoading(true);
    try {
      // Create order on your backend
      const orderResponse = await axios.post(
        `${serverEndPoint}/create_razorpay_order`,
        {
          amount: parseFloat(amount) * 100, // Convert to paise
          customer_id: customerId,
        },
        config
      );

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "KAPS",
        description: "Wallet Recharge",
        order_id: orderResponse.data.order_id,
        handler: async function (response) {
          try {
            // Verify payment on your backend
            await axios.post(
              `${serverEndPoint}/verify_razorpay_payment`,
              {
                customer_id: customerId,
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: amount,
              },
              config
            );

            toast.success("Payment successful!");
            setModal(false);
            setAmount("");
            fetchWalletDetails();
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: customerName,
          email: wallet?.email || "",
          contact: wallet?.mobile_no || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment initialization failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDirectRecharge = () => {
    if (!directAmount || parseFloat(directAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setConfirmData({
      amount: parseFloat(directAmount),
      customerName: customerName,
      customerId: customerId,
    });
    setConfirmModal(true);
  };

  const confirmDirectRecharge = async () => {
    setDirectBtnLoading(true);
    try {
      const response = await axios.post(
        `${serverEndPoint}/direct_wallet_recharge`,
        {
          customer_id: confirmData.customerId,
          amount: confirmData.amount,
          remarks: "Kaps Credits",
          admin_id: "1", // You might want to get this from user context
        },
        config
      );

      if (response.data.status === "success") {
        toast.success("Wallet recharged successfully!");
        setDirectModal(false);
        setConfirmModal(false);
        setDirectAmount("");
        setConfirmData(null);
        fetchWalletDetails();
      } else {
        toast.error(response.data.message || "Recharge failed");
      }
    } catch (error) {
      toast.error("Failed to recharge wallet");
    } finally {
      setDirectBtnLoading(false);
    }
  };

  const closeModals = () => {
    setModal(false);
    setDirectModal(false);
    setConfirmModal(false);
    setAmount("");
    setDirectAmount("");
    setConfirmData(null);
  };

  if (loading) return <Loader />;

  return (
    <Container fluid className="mt-4">
      <Row className="m-1">
        <Col xs={12}>
          <Card className="shadow-lg border-0 rounded-lg">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4>Wallet Balance - {customerName}</h4>
                  <h2>₹ {wallet?.current_balance || 0}</h2>
                </div>
                <div>
                  {/* <Button
                    color="primary"
                    onClick={() => setModal(true)}
                    className="me-2"
                  >
                    Add Money (Razorpay)
                  </Button> */}
                  <Button color="success" onClick={() => setDirectModal(true)}>
                    Add Kaps Credits
                  </Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment ID</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <tr key={transaction.transaction_id}>
                          <td>{formatEpoch(transaction.transaction_time)}</td>
                          <td>
                            <Badge
                              color={
                                transaction.transaction_type === "CREDIT" ||
                                transaction.transaction_type === "DEPOSIT"
                                  ? "success"
                                  : "danger"
                              }
                            >
                              {transaction.transaction_type}
                            </Badge>
                          </td>
                          <td>₹ {transaction.amount}</td>
                          <td>
                            <Badge
                              color={
                                transaction.status === "SUCCESS" ||
                                transaction.status === "COMPLETED"
                                  ? "success"
                                  : transaction.status === "PENDING"
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </td>
                          <td>{transaction.razorpay_payment_id || "N/A"}</td>
                          <td>{transaction.remarks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Razorpay Payment Modal */}
      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(!modal)}>
          Add Money to Wallet (Razorpay)
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
              />
            </FormGroup>

            <Button
              color="primary"
              onClick={handlePayment}
              disabled={!amount || parseFloat(amount) <= 0 || btnLoading}
            >
              {btnLoading ? "Processing..." : "Proceed to Pay"}
            </Button>
          </Form>
        </ModalBody>
      </Modal>

      {/* Direct Recharge Modal */}
      <Modal isOpen={directModal} toggle={() => setDirectModal(!directModal)}>
        <ModalHeader toggle={() => setDirectModal(!directModal)}>
          Add Kaps Credits (Direct)
        </ModalHeader>
        <ModalBody>
          <Alert color="info">
            <strong>Note:</strong> This will directly add credits to the
            customer's wallet without payment processing.
          </Alert>
          <Form>
            <FormGroup>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                min="1"
                step="0.01"
                required
              />
            </FormGroup>

            <Button
              color="success"
              onClick={handleDirectRecharge}
              disabled={!directAmount || parseFloat(directAmount) <= 0}
            >
              Proceed to Add Credits
            </Button>
          </Form>
        </ModalBody>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal}
        toggle={() => setConfirmModal(!confirmModal)}
      >
        <ModalHeader toggle={() => setConfirmModal(!confirmModal)}>
          Confirm Kaps Credits Addition
        </ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>Please confirm the following details:</strong>
          </Alert>

          <div className="mb-3">
            <strong>Customer:</strong> {confirmData?.customerName}
          </div>
          <div className="mb-3">
            <strong>Amount to Add:</strong> ₹ {confirmData?.amount}
          </div>
          <div className="mb-3">
            <strong>Reason:</strong> Kaps Credits
          </div>
          <div className="mb-3">
            <strong>Current Balance:</strong> ₹ {wallet?.current_balance || 0}
          </div>
          <div className="mb-3">
            <strong>New Balance:</strong> ₹{" "}
            {(wallet?.current_balance || 0) + (confirmData?.amount || 0)}
          </div>

          <div className="d-flex gap-2">
            <Button
              color="success"
              onClick={confirmDirectRecharge}
              disabled={directBtnLoading}
            >
              {directBtnLoading ? "Processing..." : "Confirm & Add Credits"}
            </Button>
            <Button
              color="secondary"
              onClick={() => setConfirmModal(false)}
              disabled={directBtnLoading}
            >
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default CustomerWalletDetails;
