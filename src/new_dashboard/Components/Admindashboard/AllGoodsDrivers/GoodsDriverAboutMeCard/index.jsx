/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  CardFooter,
} from "reactstrap";
import html2canvas from "html2canvas";
import { mapKey, serverEndPoint } from "../../../../../dashboard/app/constants";
import axios from "axios";
import jsPDF from "jspdf";
import Cookies from "js-cookie";

const GoodsDriverAboutMeCard = ({ driverData, onStatusUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(driverData?.status || 0);
  const [reason, setReason] = useState("");
  const [address, setAddress] = useState("Fetching address...");
  const [updating, setUpdating] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    if (driverData?.status !== undefined) {
      setSelectedStatus(driverData.status);
    }
    if (driverData?.reason) {
      setReason(driverData.reason);
    }
  }, [driverData]);

  const handleModalClick = () => {
    setIsModalOpen(true);
  };

  const handleImageProfileClick = () => {
    setIsImageModalOpen(true);
  };

  const handleImageProfileClickClose = () => {
    setIsImageModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStatusChange = (e) => {
    const newStatus = parseInt(e.target.value, 10);
    setSelectedStatus(newStatus);
    if (newStatus !== 2 && newStatus !== 3) {
      setReason("");
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const token = Cookies.get("authToken");

      const data = {
        goods_driver_id: driverData.goods_driver_id,
        status: selectedStatus,
      };

      if (selectedStatus === 2 || selectedStatus === 3) {
        data.reason = reason;
      }

      const response = await axios.post(
        `${serverEndPoint}/update_goods_driver_status`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        if (window.Swal) {
          window.Swal.fire({
            icon: "success",
            title: "Success!",
            text: `${driverData.driver_first_name} Status Updated Successfully`,
            timer: 2000,
            showConfirmButton: false,
          });
        }

        handleCloseModal();
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (window.Swal) {
        window.Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Status Update Failed",
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current, { scale: 3, useCORS: true }).then(
        (canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const printWindow = window.open("", "_blank");

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Driver Details - ${driverData.driver_first_name}</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
                img { width: 100%; max-width: 800px; }
              </style>
            </head>
            <body>
              <img src="${imgData}" alt="Driver Details"/>
            </body>
            </html>
          `);

          printWindow.document.close();
          printWindow.onload = () => printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }
      );
    }
  };

  const handleDownloadPDF = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current, { scale: 2, useCORS: true }).then(
        (canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
          pdf.save(`${driverData.driver_first_name}_Details.pdf`);
        }
      );
    }
  };

  const handleDownloadIDCard = async () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85, 85],
    });

    try {
      // Add header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("DRIVER ID CARD", 42.5, 15, { align: "center" });

      // Add driver details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const details = [
        `ID: ${driverData.goods_driver_id}`,
        `Name: ${driverData.driver_first_name} ${driverData.driver_last_name}`,
        `Status: ${driverData.status === 1 ? "Verified" : "Unverified"}`,
        `License: ${driverData.driving_license_no || "N/A"}`,
        `Vehicle: ${driverData.vehicle_plate_no || "N/A"}`,
        `Mobile: ${driverData.mobile_no || "N/A"}`,
      ];

      details.forEach((detail, index) => {
        doc.text(detail, 10, 25 + index * 8);
      });

      // Add footer
      doc.setFontSize(8);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 10, 75);

      doc.save(`${driverData.driver_first_name}_ID_Card.pdf`);
    } catch (error) {
      console.error("Error generating ID Card:", error);
    }
  };

  const getAddressFromLatLng = async (lat, lng) => {
    if (!lat || !lng || !mapKey) {
      return "Address not available";
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === "OK") {
        return response.data.results[0].formatted_address;
      } else {
        console.error("Geocode API Error:", response.data.status);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  useEffect(() => {
    const fetchAddress = async () => {
      if (driverData?.r_lat && driverData?.r_lng) {
        const fetchedAddress = await getAddressFromLatLng(
          driverData.r_lat,
          driverData.r_lng
        );
        setAddress(fetchedAddress);
      } else {
        setAddress("Address not available");
      }
    };

    fetchAddress();
  }, [driverData]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return { text: "Verified", color: "success", icon: "ti-check" };
      case 0:
        return { text: "Unverified", color: "warning", icon: "ti-warning" };
      case 2:
        return { text: "Blocked", color: "danger", icon: "ti-lock" };
      case 3:
        return { text: "Rejected", color: "secondary", icon: "ti-close" };
      default:
        return { text: "Unknown", color: "primary", icon: "ti-user" };
    }
  };

  const statusInfo = getStatusInfo(driverData?.status);

  return (
    <>
      <Card className="shadow-lg border-0 rounded">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">About Me</h5>
          <Button
            size="sm"
            color="outline-primary"
            onClick={handleImageProfileClick}
          >
            <i className="ti ti-camera"></i>
          </Button>
        </CardHeader>

        <div ref={cardRef}>
          <CardBody>
            <div className="profile-container">
              <div className="image-details">
                <div className="profile-image"></div>
                <div className="profile-pic">
                  <div className="avatar-upload">
                    <div className="avatar-preview">
                      <div
                        id="imgPreview"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "100%",
                          border: "4px dashed rgb(var(--dark), 1)",
                          backgroundColor: "rgb(var(--warning), 1)",
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={handleImageProfileClick}
                      >
                        {driverData?.profile_pic ? (
                          <img
                            src={driverData.profile_pic}
                            alt="Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>No Profile Pic</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="person-details">
                <h5 className="f-w-600">
                  {driverData?.driver_first_name} {driverData?.driver_last_name}
                </h5>
                <p>Goods Driver</p>
                <p className="font-bold">
                  {driverData?.vehicle_name} {" [ "}{" "}
                  {driverData?.vehicle_type_name} {" ]"}
                </p>

                <div className="my-2">
                  <button
                    type="button"
                    className={`btn b-r-22 btn-${statusInfo.color}`}
                    onClick={handleModalClick}
                  >
                    <i className={`ti ${statusInfo.icon}`}></i>
                    {statusInfo.text}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-muted f-s-13 text-center mb-2">
              Hello! I am {driverData?.driver_first_name}, a devoted driver with
              extensive experience.
            </p>

            <div className="about-list">
              <div>
                <span className="fw-medium">
                  <i className="ti ti-phone"></i> Contact
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.mobile_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-medium">
                  <i className="ti ti-id"></i> Aadhar No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.aadhar_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-medium">
                  <i className="ti ti-credit-card"></i> PAN No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.pan_card_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-medium">
                  <i className="ti ti-license"></i> Driving License No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.driving_license_no || "N/A"}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  <i className="ti ti-map-pin"></i> Location (Registration)
                </span>
                <span
                  className="float-end f-s-12 text-secondary text-truncate"
                  style={{
                    maxWidth: "60%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={address}
                >
                  {address}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  <i className="ti ti-map-pin"></i> Permanent Address
                </span>
                <span className="float-end f-s-12 text-secondary text-truncate">
                  {driverData?.full_address || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-user"></i> Gender
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.gender || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-truck"></i> Vehicle Registered
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.vehicle_name || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-number"></i> Vehicle Plate No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.vehicle_plate_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-book"></i> RC No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.rc_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-shield-check"></i> Insurance No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.insurance_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-file-certificate"></i> NOC No
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.noc_no || "N/A"}
                </span>
              </div>

              <div>
                <span className="fw-semibold">
                  <i className="ti ti-gas-station"></i> Vehicle Fuel Type
                </span>
                <span className="float-end f-s-13 text-secondary">
                  {driverData?.vehicle_fuel_type || "N/A"}
                </span>
              </div>
            </div>
          </CardBody>
        </div>

        <CardFooter className="d-flex justify-content-between mt-5">
          <Button
            type="button"
            color="primary"
            className="m-1"
            onClick={handlePrint}
          >
            <i className="ti ti-printer"></i> Print
          </Button>
          <Button
            type="button"
            color="success"
            className="m-1"
            onClick={handleDownloadPDF}
          >
            <i className="ti ti-download"></i> Download
          </Button>
          <Button
            type="button"
            color="warning"
            className="m-1"
            onClick={handleDownloadIDCard}
          >
            <i className="ti ti-id"></i> ID Card
          </Button>
        </CardFooter>
      </Card>

      {/* Status Update Modal */}
      <Modal
        isOpen={isModalOpen}
        toggle={handleCloseModal}
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={handleCloseModal}>Change Status</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="statusSelect">Select Status</Label>
            <Input
              type="select"
              id="statusSelect"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value={1}>Verified</option>
              <option value={0}>Unverified</option>
              <option value={2}>Blocked</option>
              <option value={3}>Rejected</option>
            </Input>
          </FormGroup>

          {(selectedStatus === 2 || selectedStatus === 3) && (
            <FormGroup>
              <Label for="reasonTextarea">Reason</Label>
              <Input
                type="textarea"
                id="reasonTextarea"
                value={reason}
                onChange={handleReasonChange}
                placeholder="Please provide a reason"
                rows={3}
              />
            </FormGroup>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={handleCloseModal}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleUpdateStatus}
            disabled={
              updating ||
              ((selectedStatus === 2 || selectedStatus === 3) && !reason)
            }
          >
            {updating ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Profile Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          imageSrc={driverData?.profile_pic}
          onClose={handleImageProfileClickClose}
        />
      )}
    </>
  );
};

// Modal Component for Profile Image
const ImageModal = ({ imageSrc, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={imageSrc}
          alt="Profile"
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            borderRadius: "10px",
            objectFit: "contain",
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default GoodsDriverAboutMeCard;
