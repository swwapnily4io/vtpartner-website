/* eslint-disable no-constant-binary-expression */
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

import { useNavigate, useParams } from "react-router-dom";

import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Cookies from "js-cookie";
// import {
//   formatEpoch,
//   serverEndPoint,
//   serverEndPointImage,
// } from "../../../../dashboard/app/constants";
import {
  serverEndPoint,
  serverEndPointImage,
  formatEpoch,
} from "../../../../../dashboard/app/constants";
import Loader from "../../../Loader";

const VehicleGuidelinesPage = () => {
  const [activeTab, setActiveTab] = useState("guidelines-tab");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const [loading, setLoading] = useState(true);
  const { vehicle_id, vehicle_name } = useParams();
  const [guidelines, setGuidelines] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [error, setError] = useState(null);
  const [openGuidelineDialog, setOpenGuidelineDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(false);

  const [selectedGuideline, setSelectedGuideline] = useState({
    guide_id: "",
    guide_line: "",
    vehicle_id: vehicle_id || "",
    added_time: "",
  });

  const [errorGuideline, setGuidelineErrors] = useState({
    guide_line: false,
    vehicle_id: false,
  });

  const [btnLoading, setBtnLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all guidelines for the vehicle
  const fetchGuidelines = async () => {
    // Check if the user is online
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your connection.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("authToken");

    try {
      const response = await axios.post(
        `${serverEndPoint}/vehicle_guidelines`,
        {
          vehicle_id: vehicle_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update state with guideline details
      setGuidelines(response.data.guideline_details || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific vehicle for display
  const fetchVehicle = async () => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your connection.");
      return;
    }

    const token = Cookies.get("authToken");

    try {
      const response = await axios.post(
        `${serverEndPoint}/get_vehicle_details`,
        {
          vehicle_id: vehicle_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setVehicles([response.data.vehicle_details] || []);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }
  };

  useEffect(() => {
    fetchGuidelines();
    fetchVehicle();
  }, [vehicle_id]);

  // Handle error responses
  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        toast.error("No guidelines found for this vehicle.");
        setError("No Data Found");
      } else if (error.response.status === 409) {
        toast.error("Guideline already exists for this vehicle.");
      } else if (error.response.status === 500) {
        toast.error("Internal server error. Please try again later.");
        setError("Internal Server Error");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
        setError("Unexpected Error");
      }
    } else {
      toast.error("Failed to fetch guidelines. Please check your connection.");
      setError("Network Error");
    }
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setSelectedGuideline({
      guide_id: "",
      guide_line: "",
      vehicle_id: vehicle_id || "",
      added_time: "",
    });
    setIsEditMode(false);
    setOpenGuidelineDialog(true);
  };

  const navigate = useNavigate();

  const handleEditClick = (guideline) => {
    setSelectedGuideline(guideline);
    setIsEditMode(true);
    setOpenGuidelineDialog(true);
  };

  const handleDeleteClick = async (guideline) => {
    if (window.confirm("Are you sure you want to delete this guideline?")) {
      try {
        const token = Cookies.get("authToken");
        const response = await axios.post(
          `${serverEndPoint}/delete_vehicle_guideline`,
          {
            guide_id: guideline.guide_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          toast.success("Guideline deleted successfully!");
          fetchGuidelines();
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenGuidelineDialog(false);
    setSelectedGuideline({
      guide_id: "",
      guide_line: "",
      vehicle_id: vehicle_id || "",
      added_time: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSelectedGuideline((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errorGuideline[name]) {
      setGuidelineErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const saveGuidelineDetails = async () => {
    setBtnLoading(true);

    const newErrors = {
      guide_line: !selectedGuideline.guide_line?.trim(),
      vehicle_id: !selectedGuideline.vehicle_id,
    };
    setGuidelineErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setBtnLoading(false);
      return;
    }

    const token = Cookies.get("authToken");
    const endpoint = isEditMode
      ? `${serverEndPoint}/edit_vehicle_guideline`
      : `${serverEndPoint}/add_vehicle_guideline`;

    try {
      const response = await axios.post(
        endpoint,
        {
          guide_id: isEditMode ? selectedGuideline.guide_id : "0",
          guide_line: selectedGuideline.guide_line,
          vehicle_id: selectedGuideline.vehicle_id,
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
            ? "Guideline updated successfully!"
            : "Guideline added successfully!"
        );
        fetchGuidelines();
        handleCloseDialog();
      } else {
        toast.error("Failed to save guideline.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setBtnLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
            <h4 className="main-title">Vehicle Guidelines Management</h4>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                  <span>
                    <i className="ph-duotone ph-stack f-s-16"></i> Vehicles
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="f-s-14 f-w-500">
                  {vehicle_name || "Vehicle"}
                </a>
              </li>
              <li className="active">
                <a href="#" className="f-s-14 f-w-500">
                  Guidelines
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
                  className="nav nav-tabs app-tabs-primary order-tabs d-flex justify-content-between border-0 mb-0 pb-0"
                  id="Outline"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link d-flex align-items-center gap-1 ${
                        activeTab === "guidelines-tab" ? "active" : ""
                      }`}
                      id="guidelines-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#guidelines-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="guidelines-tab-pane"
                      aria-selected={activeTab === "guidelines-tab"}
                      onClick={() => handleTabClick("guidelines-tab")}
                    >
                      <i className="ti ti-list-check f-s-18 mg-b-3"></i> Vehicle
                      Guidelines
                    </button>
                  </li>
                  <li>
                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-3"
                      sx={{ mb: 2 }}
                      onClick={handleOpenDialog}
                      startIcon={<AddIcon />}
                    >
                      Add New Guideline
                    </Button>
                  </li>
                </ul>
              </CardBody>

              <div className="card-body order-tab-content p-0">
                <div className="tab-content" id="OutlineContent">
                  <div
                    className={`tab-pane fade ${
                      activeTab === "guidelines-tab" ? "active show" : ""
                    }`}
                    id="guidelines-tab-pane"
                    role="tabpanel"
                    aria-labelledby="guidelines-tab"
                    tabIndex="0"
                  >
                    <div className="order-list-table table-responsive app-scroll">
                      {guidelines.length === 0 ? (
                        <div className="text-center p-5">
                          <Typography variant="h6" color="textSecondary">
                            No guidelines found for this vehicle
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenDialog}
                            sx={{ mt: 2 }}
                          >
                            Add First Guideline
                          </Button>
                        </div>
                      ) : (
                        <table className="table table-bottom-border align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Sl No</th>
                              <th scope="col">Guideline</th>
                              {/* <th scope="col">Vehicle</th> */}
                              <th scope="col">Added Date</th>
                              <th scope="col">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {guidelines.map((guideline, index) => (
                              <tr key={guideline.guide_id}>
                                <td>#{index + 1}</td>
                                <td>
                                  <div className="ms-2">
                                    <p className="mb-0 f-s-14">
                                      {guideline.guide_line}
                                    </p>
                                  </div>
                                </td>
                                {/* <td>
                                  <Chip
                                    label={vehicle_name || "Unknown Vehicle"}
                                    color="primary"
                                    size="small"
                                  />
                                </td> */}
                                <td>
                                  <p className="mb-0 f-s-12 text-secondary">
                                    {formatDate(guideline.added_time)}
                                  </p>
                                </td>
                                <td>
                                  <Tooltip title="Edit Guideline" arrow>
                                    <IconButton
                                      onClick={() => handleEditClick(guideline)}
                                      size="small"
                                    >
                                      <EditIcon color="primary" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Guideline" arrow>
                                    <IconButton
                                      onClick={() =>
                                        handleDeleteClick(guideline)
                                      }
                                      size="small"
                                    >
                                      <DeleteIcon color="error" />
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Modal for Adding or Editing Guideline */}
        <Dialog
          open={openGuidelineDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              {isEditMode ? "Edit Guideline" : "Add New Guideline"}
            </Typography>

            <FormControl fullWidth margin="normal" variant="outlined">
              <Typography variant="h6" gutterBottom>
                {vehicle_name}
              </Typography>
              {/* <Select
                name="vehicle_id"
                value={selectedGuideline.vehicle_id}
                onChange={handleInputChange}
                required
                label="Vehicle"
                error={errorGuideline.vehicle_id}
                disabled={true}
              >
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <img
                        src={vehicle.image}
                        alt={vehicle.vehicle_name}
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      {vehicle.vehicle_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select> */}
            </FormControl>

            <TextField
              label="Guideline"
              fullWidth
              margin="normal"
              name="guide_line"
              value={selectedGuideline.guide_line}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              error={errorGuideline.guide_line}
              helperText={
                errorGuideline.guide_line
                  ? "Guideline text is required."
                  : "Enter the guideline text for this vehicle"
              }
              placeholder="Enter guideline text here..."
            />

            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <LoadingButton
                type="submit"
                color="primary"
                loading={btnLoading}
                variant="contained"
                onClick={saveGuidelineDetails}
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

export default VehicleGuidelinesPage;
