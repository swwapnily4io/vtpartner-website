import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Icon,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast, ToastContainer } from "react-toastify";

import { format } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";
import { serverEndPoint } from "../../../../dashboard/app/constants";
import { Card, CardBody, Col, Container, Row } from "reactstrap";

const ControlSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [selectedSetting, setSelectedSetting] = useState({
    control_id: "",
    controller_name: "",
    values: "",
    admin_id: "1", // Default admin ID
  });

  const [errors, setErrors] = useState({
    controller_name: false,
    values: false,
  });

  // Controller options with value type definitions
  const controllerOptions = [
    {
      value: "PER_COIN_PRICE",
      label: "Per Coin Price",
      type: "number",
      description: "Price per coin in currency",
    },
    {
      value: "SIGN_UP_BONUS_CUSTOMER_APP",
      label: "Sign Up Bonus Customer App",
      type: "number",
      description: "sign up bonus for customers in the app in rupees",
    },
    {
      value: "SIGN_UP_BONUS_AGENT_APP",
      label: "Sign Up Bonus Agent App",
      type: "number",
      description: "sign up bonus for agent in the app in rupees",
    },
    {
      value: "Agent Cancel Button Show",
      label: "Agent Cancel Button Show",
      type: "dropdown",
      options: ["Yes", "No"],
      description: "Show/hide cancel button for agents",
    },
    {
      value: "Hike Price Show",
      label: "Hike Price Show",
      type: "dropdown",
      options: ["Yes", "No"],
      description: "Show/hide hike price feature",
    },
    {
      value: "Agent Recharge Expiry Show",
      label: "Agent Recharge Expiry Show",
      type: "dropdown",
      options: ["Yes", "No"],
      description: "Show/hide recharge expiry for agents",
    },
    {
      value: "Booking TimeOut",
      label: "Booking Timeout (minutes)",
      type: "number",
      description: "Booking timeout duration in minutes",
    },
    {
      value: "Multiple Drops",
      label: "Multiple Drops",
      type: "number",
      description: "Maximum number of drop locations allowed",
    },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await axios.post(
        `${serverEndPoint}/get_all_control_settings`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSettings(response.data.control_settings);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setSelectedSetting({
      control_id: "",
      controller_name: "",
      values: "",
      admin_id: "1",
    });
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEditClick = (setting) => {
    setSelectedSetting(setting);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({
      controller_name: false,
      values: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedSetting((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getControllerType = (controllerName) => {
    const controller = controllerOptions.find(
      (opt) => opt.value === controllerName
    );
    return controller ? controller.type : "text";
  };

  const getControllerOptions = (controllerName) => {
    const controller = controllerOptions.find(
      (opt) => opt.value === controllerName
    );
    return controller ? controller.options : [];
  };

  const getControllerDescription = (controllerName) => {
    const controller = controllerOptions.find(
      (opt) => opt.value === controllerName
    );
    return controller ? controller.description : "";
  };

  const renderValueField = () => {
    const controllerType = getControllerType(selectedSetting.controller_name);
    const controllerOptions = getControllerOptions(
      selectedSetting.controller_name
    );

    switch (controllerType) {
      case "dropdown":
        return (
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Values</InputLabel>
            <Select
              name="values"
              value={selectedSetting.values}
              onChange={handleInputChange}
              required
              label="Values"
              error={errors.values}
            >
              {controllerOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "number":
        return (
          <TextField
            label="Values"
            name="values"
            value={selectedSetting.values}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="number"
            required
            InputProps={{
              inputProps: { min: 0 },
            }}
            error={errors.values}
            helperText={errors.values ? "Values are required" : ""}
          />
        );

      default:
        return (
          <TextField
            label="Values"
            name="values"
            value={selectedSetting.values}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            error={errors.values}
            helperText={errors.values ? "Values are required" : ""}
          />
        );
    }
  };

  const getStatusChip = (value) => {
    if (value === "Yes" || value === "YES") {
      return <Chip label="Enabled" color="success" size="small" />;
    } else if (value === "No" || value === "NO") {
      return <Chip label="Disabled" color="error" size="small" />;
    } else {
      return <Chip label={value} color="default" size="small" />;
    }
  };

  const handleSubmit = async () => {
    setBtnLoading(true);

    const newErrors = {
      controller_name: !selectedSetting.controller_name,
      values: !selectedSetting.values,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setBtnLoading(false);
      return;
    }

    try {
      const token = Cookies.get("authToken");
      const endpoint = isEditMode
        ? "edit_control_setting"
        : "add_control_setting";

      const response = await axios.post(
        `${serverEndPoint}/${endpoint}`,
        selectedSetting,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message);
      handleCloseDialog();
      fetchSettings();
    } catch (error) {
      handleError(error);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 409) {
        toast.error("Controller name already exists");
      } else {
        toast.error(error.response.data.message || "An error occurred");
      }
    } else {
      toast.error("Network error occurred");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <ToastContainer position="top-right" />
      <Container fluid>
        <Row className="m-1">
          <Col xs={12}>
            <h4 className="main-title">Main Settings</h4>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                  <span>
                    <i className="ph-duotone ph-stack f-s-16"></i> Settings
                  </span>
                </a>
              </li>
              <li className="active mt-2">
                <a href="#" className="f-s-14 f-w-500">
                  Control Settings
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card className="shadow-lg border-0 rounded-lg">
              <CardBody>
                <ul className="nav nav-tabs app-tabs-primary order-tabs d-flex justify-content-start border-0 mb-0 pb-0">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link d-flex align-items-center gap-1 active"
                      role="tab"
                    >
                      <i className="ti ti-sort-descending-2 f-s-18 mg-b-3"></i>
                      All Settings
                    </button>

                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-3"
                      sx={{ mb: 2 }}
                      onClick={handleOpenDialog}
                    >
                      Add New Setting
                    </Button>
                  </li>
                </ul>
              </CardBody>

              <div className="card-body order-tab-content p-0">
                <div className="order-list-table table-responsive app-scroll">
                  <table className="table table-bottom-border align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Controller Name</th>
                        <th scope="col">Values</th>
                        <th scope="col">Last Updated</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.map((setting) => (
                        <tr key={setting.control_id}>
                          <td>
                            <div className="ms-2">
                              <h6 className="mb-0 f-s-16">
                                {setting.controller_name}
                              </h6>
                              <p className="mb-0 f-s-12 text-secondary">
                                {getControllerDescription(
                                  setting.controller_name
                                )}
                              </p>
                            </div>
                          </td>
                          <td>{getStatusChip(setting.values)}</td>
                          <td>
                            <p className="mb-0 f-s-12 text-secondary">
                              {format(
                                new Date(setting.last_updated_time * 1000),
                                "dd/MM/yyyy, hh:mm:ss a"
                              )}
                            </p>
                          </td>
                          <td>
                            <Tooltip title="Edit Setting" arrow>
                              <IconButton
                                onClick={() => handleEditClick(setting)}
                              >
                                <Icon color="primary">edit</Icon>
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Enhanced Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {isEditMode ? "Edit Setting" : "Add New Setting"}
          </Typography>

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Controller Name</InputLabel>
            <Select
              name="controller_name"
              value={selectedSetting.controller_name}
              onChange={handleInputChange}
              required
              label="Controller Name"
              error={errors.controller_name}
            >
              {controllerOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedSetting.controller_name && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mb: 1, display: "block" }}
            >
              {getControllerDescription(selectedSetting.controller_name)}
            </Typography>
          )}

          {renderValueField()}

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseDialog} sx={{ marginRight: 1 }}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              color="primary"
              loading={btnLoading}
              variant="contained"
              onClick={handleSubmit}
            >
              {isEditMode ? "Update" : "Save"}
            </LoadingButton>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
};

export default ControlSettings; 