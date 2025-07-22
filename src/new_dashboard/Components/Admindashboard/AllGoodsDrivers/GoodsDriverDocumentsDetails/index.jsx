/* eslint-disable react/prop-types */
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Glightbox from "glightbox";
import "glightbox/dist/css/glightbox.min.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { serverEndPoint } from "../../../../../dashboard/app/constants";

const GoodsDriverDocumentsDetails = ({ driverData, onImageUpdate }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const lightbox = Glightbox({
      selector: ".glightbox",
      touchNavigation: true,
      loop: true,
      closeButton: true,
    });

    return () => {
      lightbox.destroy();
    };
  }, []);

  const handleImageEdit = (imageKey, imageUrl) => {
    setSelectedImage({ key: imageKey, url: imageUrl });
    setIsImageModalOpen(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const token = Cookies.get("authToken");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("goods_driver_id", driverData.goods_driver_id);
    formData.append("image_type", selectedImage.key);

    try {
      setUploading(true);
      const response = await axios.post(
        `${serverEndPoint}/update_goods_driver_image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Show success message
        if (window.Swal) {
          window.Swal.fire({
            icon: "success",
            title: "Success!",
            text: response.data.message,
            timer: 2000,
            showConfirmButton: false,
          });
        }

        // Close modal and refresh data
        setIsImageModalOpen(false);
        setSelectedImage(null);
        if (onImageUpdate) {
          onImageUpdate();
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      if (window.Swal) {
        window.Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.error || "Failed to upload image",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const imageConfig = [
    {
      key: "recent_online_pic",
      label: "Recent Online Picture",
      icon: "ti ti-camera",
    },
    {
      key: "aadhar_card_front",
      label: "Aadhar Card Front",
      icon: "ti ti-id",
    },
    {
      key: "aadhar_card_back",
      label: "Aadhar Card Back",
      icon: "ti ti-id",
    },
    {
      key: "pan_card_front",
      label: "PAN Card Front",
      icon: "ti ti-credit-card",
    },
    {
      key: "pan_card_back",
      label: "PAN Card Back",
      icon: "ti ti-credit-card",
    },
    {
      key: "license_front",
      label: "Driving License Front",
      icon: "ti ti-license",
    },
    {
      key: "license_back",
      label: "Driving License Back",
      icon: "ti ti-license",
    },
    {
      key: "insurance_image",
      label: "Insurance Certificate",
      icon: "ti ti-shield-check",
    },
    {
      key: "noc_image",
      label: "NOC Certificate",
      icon: "ti ti-file-certificate",
    },
    {
      key: "pollution_certificate_image",
      label: "Pollution Certificate",
      icon: "ti ti-leaf",
    },
    {
      key: "rc_image",
      label: "RC Book",
      icon: "ti ti-book",
    },
    {
      key: "driver_vehicle_image",
      label: "Vehicle Image",
      icon: "ti ti-truck",
    },
    {
      key: "vehicle_plate_image",
      label: "Vehicle Plate",
      icon: "ti ti-number",
    },
  ];

  return (
    <>
      <Card className="shadow-lg border-0 rounded">
        <CardBody>
          <div className="d-flex align-items-center mb-4">
            <div className="h-45 w-45 d-flex-center b-r-50 overflow-hidden bg-danger me-3">
              <img
                src={driverData.profile_pic || "/assets/images/avtar/16.png"}
                alt="Profile"
                className="img-fluid"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="flex-grow-1">
              <div className="f-w-600 d-flex align-items-center">
                {driverData.driver_first_name} {driverData.driver_last_name}
                <span
                  className={`badge ms-2 bg-${(() => {
                    if (driverData.is_online === 1) return "success";
                    if (driverData.is_online === 2) return "danger";
                    return "light";
                  })()}`}
                >
                  {(() => {
                    if (driverData.is_online === 1) return "Online";
                    if (driverData.is_online === 0) return "Offline";
                    return "Unknown";
                  })()}
                </span>
              </div>
              <div className="text-muted f-s-12">
                Registered with us from {driverData.registration_date}
              </div>
            </div>
          </div>

          <div className="post-div">
            <Row className="g-2 my-2">
              {imageConfig.map(({ key, label, icon }) => {
                const imageUrl = driverData[key];
                if (imageUrl && imageUrl !== "NA") {
                  return (
                    <Col xs="6" md="4" lg="3" key={key}>
                      <div className="image-container position-relative">
                        <div className="image-header d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted f-s-11">
                            <i className={`${icon} me-1`}></i>
                            {label}
                          </small>
                          <Button
                            size="sm"
                            color="outline-primary"
                            onClick={() => handleImageEdit(key, imageUrl)}
                            className="p-1"
                          >
                            <i className="ti ti-edit f-s-10"></i>
                          </Button>
                        </div>
                        <a
                          href={imageUrl}
                          className="glightbox"
                          data-glightbox="type: image; zoomable: true;"
                          data-title={label}
                        >
                          <img
                            src={imageUrl}
                            className="w-100 h-200 rounded"
                            alt={label}
                            style={{ objectFit: "cover" }}
                          />
                        </a>
                      </div>
                    </Col>
                  );
                }
                return (
                  <Col xs="6" md="4" lg="3" key={key}>
                    <div className="image-container">
                      <div className="image-header d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted f-s-11">
                          <i className={`${icon} me-1`}></i>
                          {label}
                        </small>
                        <Button
                          size="sm"
                          color="outline-success"
                          onClick={() => handleImageEdit(key, null)}
                          className="p-1"
                        >
                          <i className="ti ti-plus f-s-10"></i>
                        </Button>
                      </div>
                      <div className="w-100 h-200 rounded border-2 border-dashed d-flex align-items-center justify-content-center bg-light">
                        <div className="text-center text-muted">
                          <i className={`${icon} f-s-24 mb-2 d-block`}></i>
                          <small>No Image</small>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        </CardBody>
      </Card>

      {/* Image Edit Modal */}
      <Modal
        isOpen={isImageModalOpen}
        toggle={() => setIsImageModalOpen(!isImageModalOpen)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setIsImageModalOpen(!isImageModalOpen)}>
          {selectedImage
            ? `Edit ${selectedImage.key.replace(/_/g, " ").toUpperCase()}`
            : "Upload Image"}
        </ModalHeader>
        <ModalBody>
          {selectedImage && (
            <div className="mb-3">
              <h6>Current Image:</h6>
              {selectedImage.url ? (
                <img
                  src={selectedImage.url}
                  alt="Current"
                  className="img-fluid rounded"
                  style={{ maxHeight: "200px" }}
                />
              ) : (
                <div className="text-center p-4 bg-light rounded">
                  <i className="ti ti-photo f-s-24 text-muted"></i>
                  <p className="text-muted mt-2">No current image</p>
                </div>
              )}
            </div>
          )}

          <FormGroup>
            <Label for="imageUpload">Upload New Image</Label>
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              disabled={uploading}
            />
            <small className="text-muted">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setIsImageModalOpen(!isImageModalOpen)}
            disabled={uploading}
          >
            Cancel
          </Button>
          {uploading && (
            <div className="d-flex align-items-center">
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              Uploading...
            </div>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default GoodsDriverDocumentsDetails; 