/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
} from "reactstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { serverEndPoint } from "../../../../../dashboard/app/constants";

const GoodsDriverEditModal = ({ isOpen, toggle, driverData, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (driverData) {
      setFormData({
        driver_first_name: driverData.driver_first_name || "",
        driver_last_name: driverData.driver_last_name || "",
        mobile_no: driverData.mobile_no || "",
        aadhar_no: driverData.aadhar_no || "",
        pan_card_no: driverData.pan_card_no || "",
        house_no: driverData.house_no || "",
        city_name: driverData.city_name || "",
        full_address: driverData.full_address || "",
        gender: driverData.gender || "",
        driving_license_no: driverData.driving_license_no || "",
        vehicle_plate_no: driverData.vehicle_plate_no || "",
        rc_no: driverData.rc_no || "",
        insurance_no: driverData.insurance_no || "",
        noc_no: driverData.noc_no || "",
        vehicle_fuel_type: driverData.vehicle_fuel_type || "",
        reason: driverData.reason || "",
      });
    }
  }, [driverData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert PAN card to uppercase
    const processedValue = name === "pan_card_no" ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.driver_first_name?.trim()) {
      newErrors.driver_first_name = "First name is required";
    }

    if (!formData.driver_last_name?.trim()) {
      newErrors.driver_last_name = "Last name is required";
    }

    if (!formData.mobile_no?.trim()) {
      newErrors.mobile_no = "Mobile number is required";
    } else if (!/^\+91\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no =
        "Mobile number must be in format: +91XXXXXXXXXX (10 digits after +91)";
    }

    // Aadhar validation (12 digits)
    if (formData.aadhar_no && !/^\d{12}$/.test(formData.aadhar_no)) {
      newErrors.aadhar_no = "Aadhar number must be 12 digits";
    }

    // PAN validation (10 characters) - format: ABCDE1234F
    if (
      formData.pan_card_no &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_card_no.toUpperCase())
    ) {
      newErrors.pan_card_no =
        "PAN number must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
    }

    // Driving license validation
    if (
      formData.driving_license_no &&
      formData.driving_license_no.length < 10
    ) {
      newErrors.driving_license_no = "Driving license number is too short";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);
      setSuccessMessage("");

      const token = Cookies.get("authToken");
      const response = await axios.post(
        `${serverEndPoint}/update_goods_driver_details`,
        {
          goods_driver_id: driverData.goods_driver_id,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Driver details updated successfully!");

        if (window.Swal) {
          window.Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Driver details updated successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        // Close modal after a short delay
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating driver details:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update driver details";

      if (window.Swal) {
        window.Swal.fire({
          icon: "error",
          title: "Error!",
          text: errorMessage,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setSuccessMessage("");
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="xl" scrollable>
      <ModalHeader toggle={handleClose}>
        <i className="ti ti-edit me-2"></i>
        Edit Driver Details
      </ModalHeader>
      <ModalBody>
        {successMessage && (
          <Alert color="success" className="mb-3">
            {successMessage}
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <CardBody>
                  <h6 className="card-title mb-3">
                    <i className="ti ti-user me-2"></i>
                    Personal Information
                  </h6>

                  <FormGroup>
                    <Label for="driver_first_name">First Name *</Label>
                    <Input
                      id="driver_first_name"
                      name="driver_first_name"
                      type="text"
                      value={formData.driver_first_name || ""}
                      onChange={handleInputChange}
                      invalid={!!errors.driver_first_name}
                    />
                    {errors.driver_first_name && (
                      <div className="invalid-feedback d-block">
                        {errors.driver_first_name}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="driver_last_name">Last Name *</Label>
                    <Input
                      id="driver_last_name"
                      name="driver_last_name"
                      type="text"
                      value={formData.driver_last_name || ""}
                      onChange={handleInputChange}
                      invalid={!!errors.driver_last_name}
                    />
                    {errors.driver_last_name && (
                      <div className="invalid-feedback d-block">
                        {errors.driver_last_name}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="mobile_no">Mobile Number *</Label>
                    <Input
                      id="mobile_no"
                      name="mobile_no"
                      type="tel"
                      value={formData.mobile_no || ""}
                      onChange={handleInputChange}
                      invalid={!!errors.mobile_no}
                      placeholder="+91XXXXXXXXXX"
                    />
                    {errors.mobile_no && (
                      <div className="invalid-feedback d-block">
                        {errors.mobile_no}
                      </div>
                    )}
                    <small className="text-muted">
                      Format: +91 followed by 10-digit mobile number
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <Label for="gender">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      type="select"
                      value={formData.gender || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Input>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <CardBody>
                  <h6 className="card-title mb-3">
                    <i className="ti ti-id me-2"></i>
                    Identity Documents
                  </h6>

                  <FormGroup>
                    <Label for="aadhar_no">Aadhar Number</Label>
                    <Input
                      id="aadhar_no"
                      name="aadhar_no"
                      type="text"
                      value={formData.aadhar_no || ""}
                      onChange={handleInputChange}
                      invalid={!!errors.aadhar_no}
                      placeholder="12-digit Aadhar number"
                    />
                    {errors.aadhar_no && (
                      <div className="invalid-feedback d-block">
                        {errors.aadhar_no}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label for="pan_card_no">PAN Number</Label>
                    <Input
                      id="pan_card_no"
                      name="pan_card_no"
                      type="text"
                      value={formData.pan_card_no || ""}
                      onChange={handleInputChange}
                      invalid={!!errors.pan_card_no}
                      placeholder="ABCDE1234F"
                      style={{ textTransform: "uppercase" }}
                    />
                    {errors.pan_card_no && (
                      <div className="invalid-feedback d-block">
                        {errors.pan_card_no}
                      </div>
                    )}
                    <small className="text-muted">
                      Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <Label for="driving_license_no">
                      Driving License Number
                    </Label>
                    <Input
                      id="driving_license_no"
                      name="driving_license_no"
                      type="text"
                      value={formData.driving_license_no || ""}
                      onChange={handleInputChange}
                      invalid={!!errors.driving_license_no}
                    />
                    {errors.driving_license_no && (
                      <div className="invalid-feedback d-block">
                        {errors.driving_license_no}
                      </div>
                    )}
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <CardBody>
                  <h6 className="card-title mb-3">
                    <i className="ti ti-map-pin me-2"></i>
                    Address Information
                  </h6>

                  <FormGroup>
                    <Label for="house_no">House Number</Label>
                    <Input
                      id="house_no"
                      name="house_no"
                      type="text"
                      value={formData.house_no || ""}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="city_name">City</Label>
                    <Input
                      id="city_name"
                      name="city_name"
                      type="text"
                      value={formData.city_name || ""}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="full_address">Full Address</Label>
                    <Input
                      id="full_address"
                      name="full_address"
                      type="textarea"
                      value={formData.full_address || ""}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <CardBody>
                  <h6 className="card-title mb-3">
                    <i className="ti ti-truck me-2"></i>
                    Vehicle Information
                  </h6>

                  <FormGroup>
                    <Label for="vehicle_plate_no">Vehicle Plate Number</Label>
                    <Input
                      id="vehicle_plate_no"
                      name="vehicle_plate_no"
                      type="text"
                      value={formData.vehicle_plate_no || ""}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="rc_no">RC Number</Label>
                    <Input
                      id="rc_no"
                      name="rc_no"
                      type="text"
                      value={formData.rc_no || ""}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="insurance_no">Insurance Number</Label>
                    <Input
                      id="insurance_no"
                      name="insurance_no"
                      type="text"
                      value={formData.insurance_no || ""}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="noc_no">NOC Number</Label>
                    <Input
                      id="noc_no"
                      name="noc_no"
                      type="text"
                      value={formData.noc_no || ""}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="vehicle_fuel_type">Vehicle Fuel Type</Label>
                    <Input
                      id="vehicle_fuel_type"
                      name="vehicle_fuel_type"
                      type="select"
                      value={formData.vehicle_fuel_type || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </Input>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="mb-3">
                <CardBody>
                  <h6 className="card-title mb-3">
                    <i className="ti ti-note me-2"></i>
                    Additional Information
                  </h6>

                  <FormGroup>
                    <Label for="reason">Reason (if blocked/rejected)</Label>
                    <Input
                      id="reason"
                      name="reason"
                      type="textarea"
                      value={formData.reason || ""}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter reason if driver is blocked or rejected..."
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={uploading}>
          {uploading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              Updating...
            </>
          ) : (
            <>
              <i className="ti ti-device-floppy me-2"></i>
              Update Details
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default GoodsDriverEditModal;
