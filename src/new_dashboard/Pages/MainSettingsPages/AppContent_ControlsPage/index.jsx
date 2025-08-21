/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Icon,
  Avatar,
  Tooltip,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast, ToastContainer } from "react-toastify";
import { styled } from "@mui/system";

import { useNavigate } from "react-router-dom";

import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import Cookies from "js-cookie";
import {
  formatEpoch,
  serverEndPoint,
  serverEndPointImage,
} from "../../../../dashboard/app/constants";
import Loader from "../../../Components/Loader";

const AppContentDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState("content-tab");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const [loading, setLoading] = useState(true);
  const [appContent, setAppContent] = useState([]);
  const [error, setError] = useState(null);
  const [openContentDialog, setOpenContentDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageSizeError, setImageSizeError] = useState(false);

  const [selectedContent, setSelectedContent] = useState({
    content_id: "",
    screen_name: "",
    title: "",
    description: "",
    image_url: "",
    sort_order: "",
    status: 1,
  });

  const [errorContent, setContentErrors] = useState({
    screen_name: false,
    title: false,
    description: false,
    image_url: false,
    sort_order: false,
  });

  const [btnLoading, setBtnLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Screen name options with image size requirements
  const screenOptions = [
    {
      value: "customer_splash_screen",
      label: "Customer App Splash Screen",
      imageSize: { width: 1250, height: 1250 },
    },
    {
      value: "agent_splash_screen",
      label: "Agent App Splash Screen",
      imageSize: { width: 1250, height: 1250 },
    },
    {
      value: "agent_location_type",
      label: "Agent App location preference screen",
      imageSize: { width: 500, height: 500 },
    },
    {
      value: "agent_body_type",
      label: "Agent App body type preference screen",
      imageSize: { width: 500, height: 500 },
    },
    {
      value: "onboarding_1",
      label: "Onboarding Screen 1",
      imageSize: { width: 961, height: 746 },
    },
    {
      value: "onboarding_2",
      label: "Onboarding Screen 2",
      imageSize: { width: 961, height: 746 },
    },
    {
      value: "onboarding_3",
      label: "Onboarding Screen 3",
      imageSize: { width: 961, height: 746 },
    },
    {
      value: "login",
      label: "Login Screen",
      imageSize: { width: 1250, height: 1250 },
    },
    {
      value: "otp",
      label: "OTP Screen",
      imageSize: { width: 281, height: 269 },
    },
    {
      value: "booking_type_local",
      label: "Booking type local",
      imageSize: { width: 512, height: 512 },
    },
    {
      value: "booking_type_outstation",
      label: "Booking type outstation",
      imageSize: { width: 512, height: 512 },
    },
    {
      value: "invite_friends",
      label: "Invite your friends",
      imageSize: { width: 500, height: 500 },
    },
    {
      value: "kaps_coin",
      label: "Kaps Coins",
      imageSize: { width: 500, height: 500 },
    },
    {
      value: "enjoy_your_earning",
      label: "Enjoy your earning",
      imageSize: { width: 500, height: 500 },
    },
  ];

  // Fetch all app content
  const fetchAppContent = async () => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your connection.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("authToken");

    try {
      const response = await axios.post(
        `${serverEndPoint}/get_app_content`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAppContent(response.data.content_details || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppContent();
  }, []);

  // Handle error responses
  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        toast.error("No Data Found.");
        setError("No Data Found");
      } else if (error.response.status === 409) {
        toast.error("Content for this screen already exists.");
      } else if (error.response.status === 500) {
        toast.error("Internal server error. Please try again later.");
        setError("Internal Server Error");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
        setError("Unexpected Error");
      }
    } else {
      toast.error("Failed to fetch app content. Please check your connection.");
      setError("Network Error");
    }
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setSelectedContent({
      content_id: "",
      screen_name: "",
      title: "",
      description: "",
      image_url: "",
      sort_order: "",
      status: 1,
    });
    setIsEditMode(false);
    setOpenContentDialog(true);
    setImageFile(null);
    setImageError(false);
    setImageSizeError(false);
  };

  const handleEditClick = (content) => {
    setSelectedContent(content);
    setIsEditMode(true);
    setOpenContentDialog(true);
    setImageFile(null);
    setImageError(false);
    setImageSizeError(false);
  };

  const handleCloseDialog = () => {
    setOpenContentDialog(false);
    setContentErrors({
      screen_name: false,
      title: false,
      description: false,
      image_url: false,
      sort_order: false,
    });
    setImageError(false);
    setImageSizeError(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedContent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const saveContentDetails = async () => {
    setBtnLoading(true);

    const newErrors = {
      screen_name: !selectedContent.screen_name,
      title: !selectedContent.title,
      description: !selectedContent.description,
      image_url: !imageFile && !selectedContent.image_url,
      sort_order:
        !selectedContent.sort_order || isNaN(selectedContent.sort_order),
    };
    setContentErrors(newErrors);

    if (
      Object.values(newErrors).some((error) => error) ||
      imageError ||
      imageSizeError
    ) {
      setBtnLoading(false);
      return;
    }

    let imageUrl = selectedContent.image_url;

    // Handle image upload
    try {
      if (imageFile) {
        console.log("imageFile::", imageFile);
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await axios.post(
          `${serverEndPointImage}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = uploadResponse.data.image_url;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image or file size too large (max 2MB)");
      setBtnLoading(false);
      return;
    }

    const token = Cookies.get("authToken");
    const endpoint = isEditMode
      ? `${serverEndPoint}/update_app_content`
      : `${serverEndPoint}/add_app_content`;

    try {
      const response = await axios.post(
        endpoint,
        {
          content_id: isEditMode ? selectedContent.content_id : "0",
          screen_name: selectedContent.screen_name,
          title: selectedContent.title,
          description: selectedContent.description,
          image_url: imageUrl,
          sort_order: Number(selectedContent.sort_order),
          status: selectedContent.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          isEditMode
            ? "Content updated successfully!"
            : "Content added successfully!"
        );
        fetchAppContent();
        handleCloseDialog();
        setImageFile(null);
      } else {
        toast.error("Failed to save content.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ];

      if (!validImageTypes.includes(file.type)) {
        setImageError(true);
        setImageSizeError(false);
        toast.warning(
          "Only .png, .jpeg, .jpg, and .svg file formats are allowed."
        );
        e.target.value = "";
        return;
      }

      // Check image dimensions for onboarding screens
      const selectedScreen = screenOptions.find(
        (opt) => opt.value === selectedContent.screen_name
      );

      if (selectedScreen && selectedScreen.imageSize) {
        const img = new Image();
        img.onload = () => {
          if (
            img.width !== selectedScreen.imageSize.width ||
            img.height !== selectedScreen.imageSize.height
          ) {
            setImageSizeError(true);
            setImageError(false);
            toast.error(
              `Image dimensions must be ${selectedScreen.imageSize.width}x${selectedScreen.imageSize.height} pixels for ${selectedScreen.label}`
            );
            e.target.value = "";
            return;
          } else {
            setImageFile(file);
            setImageError(false);
            setImageSizeError(false);
            console.log("Image File:", file);
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        setImageFile(file);
        setImageError(false);
        setImageSizeError(false);
        console.log("Image File:", file);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    return status === 1 ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Inactive" color="error" size="small" />
    );
  };

  const getScreenLabel = (screenName) => {
    const screen = screenOptions.find((opt) => opt.value === screenName);
    return screen ? screen.label : screenName;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <ToastContainer position="top-right" />
      <Container fluid>
        <Row className="m-1">
          <Col xs={12}>
            <h4 className="main-title">App Content Management</h4>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                  <span>
                    <i className="ph-duotone ph-devices f-s-16"></i> App
                    Settings
                  </span>
                </a>
              </li>
              <li className="active mt-2">
                <a href="#" className="f-s-14 f-w-500">
                  Content Management
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Card className="shadow-lg border-0 rounded-lg">
              <CardBody>
                <ul
                  className="nav nav-tabs app-tabs-primary order-tabs d-flex justify-content-start border-0 mb-0 pb-0"
                  id="Outline"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link d-flex align-items-center gap-1 ${
                        activeTab === "content-tab" ? "active" : ""
                      }`}
                      id="content-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#content-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="content-tab-pane"
                      aria-selected={activeTab === "content-tab"}
                      onClick={() => handleTabClick("content-tab")}
                    >
                      <i className="ti ti-file-text f-s-18 mg-b-3"></i>
                      All App Content
                    </button>

                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-3"
                      sx={{ mb: 2 }}
                      onClick={handleOpenDialog}
                    >
                      Add New Content
                    </Button>
                  </li>
                </ul>
              </CardBody>

              <div className="card-body order-tab-content p-0">
                <div className="tab-content" id="OutlineContent">
                  <div
                    className={`tab-pane fade ${
                      activeTab === "content-tab" ? "active show" : ""
                    }`}
                    id="content-tab-pane"
                    role="tabpanel"
                    aria-labelledby="content-tab"
                    tabIndex="0"
                  >
                    <div className="order-list-table table-responsive app-scroll">
                      <table className="table table-bottom-border align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Sl No</th>
                            <th scope="col">Screen</th>
                            <th scope="col">Title</th>
                            <th scope="col">Description</th>
                            <th scope="col">Image</th>
                            <th scope="col">Sort Order</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appContent
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((content, index) => (
                              <tr key={content.content_id}>
                                <td># {page * rowsPerPage + index + 1}</td>
                                <td>
                                  <div>
                                    <h6 className="mb-0 f-s-14">
                                      {getScreenLabel(content.screen_name)}
                                    </h6>
                                    <p className="mb-0 f-s-12 text-secondary">
                                      {content.screen_name}
                                    </p>
                                  </div>
                                </td>
                                <td>
                                  <h6 className="mb-0 f-s-14">
                                    {content.title}
                                  </h6>
                                </td>
                                <td>
                                  <p className="mb-0 f-s-12 text-secondary">
                                    {content.description &&
                                    content.description !== "NA"
                                      ? content.description.length > 50
                                        ? content.description.substring(0, 50) +
                                          "..."
                                        : content.description
                                      : "No description"}
                                  </p>
                                </td>
                                <td>
                                  <div className="h-40 w-40 d-flex-center b-r-15 overflow-hidden">
                                    <img
                                      src={content.image_url}
                                      alt={content.title}
                                      className="img-fluid"
                                      style={{
                                        maxHeight: "40px",
                                        maxWidth: "40px",
                                      }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <p className="mb-0 f-s-12 text-secondary">
                                    {content.sort_order}
                                  </p>
                                </td>
                                <td>{getStatusChip(content.status)}</td>
                                <td>
                                  <Tooltip title="Edit Content" arrow>
                                    <IconButton
                                      onClick={() => handleEditClick(content)}
                                    >
                                      <EditIcon color="primary" />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      <TablePagination
                        component="div"
                        count={appContent.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Modal for Adding or Editing Content */}
        <Dialog
          open={openContentDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              {isEditMode ? "Edit App Content" : "Add New App Content"}
            </Typography>

            {isEditMode && selectedContent.image_url && (
              <Box display="flex" justifyContent="center" mb={2}>
                <img
                  src={selectedContent.image_url}
                  alt={selectedContent.title}
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Screen Name</InputLabel>
              <Select
                name="screen_name"
                value={selectedContent.screen_name}
                onChange={handleInputChange}
                required
                label="Screen Name"
                error={errorContent.screen_name}
              >
                {screenOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Title"
              fullWidth
              margin="normal"
              name="title"
              value={selectedContent.title}
              onChange={handleInputChange}
              required
              error={errorContent.title}
              helperText={errorContent.title ? "Title is required." : ""}
            />

            <TextField
              label="Description"
              fullWidth
              margin="normal"
              name="description"
              value={selectedContent.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              error={errorContent.description}
              helperText={
                errorContent.description ? "Description is required." : ""
              }
            />

            <TextField
              label="Sort Order"
              fullWidth
              margin="normal"
              name="sort_order"
              type="number"
              value={selectedContent.sort_order}
              onChange={handleInputChange}
              required
              InputProps={{
                inputProps: { min: 0 },
              }}
              error={errorContent.sort_order}
              helperText={
                errorContent.sort_order ? "Sort order is required." : ""
              }
            />

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={selectedContent.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Content Image
            </Typography>
            {selectedContent.screen_name &&
              (() => {
                const selectedScreen = screenOptions.find(
                  (opt) => opt.value === selectedContent.screen_name
                );
                return selectedScreen && selectedScreen.imageSize ? (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Required dimensions: {selectedScreen.imageSize.width}x
                    {selectedScreen.imageSize.height} pixels
                  </Typography>
                ) : null;
              })()}
            <TextField
              fullWidth
              margin="normal"
              type="file"
              onChange={handleImageChange}
              required={!isEditMode}
              error={errorContent.image_url || imageError || imageSizeError}
              helperText={
                errorContent.image_url
                  ? "Image is required."
                  : imageError
                  ? "Invalid file format. Only .png, .jpeg, .jpg,.gif and .svg are allowed."
                  : imageSizeError
                  ? "Image dimensions do not match requirements."
                  : ""
              }
            />

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseDialog} sx={{ marginRight: 1 }}>
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                color="primary"
                loading={btnLoading}
                variant="contained"
                onClick={saveContentDetails}
              >
                {isEditMode ? "Update" : "Create"}
              </LoadingButton>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
};

export default AppContentDashboardScreen;
