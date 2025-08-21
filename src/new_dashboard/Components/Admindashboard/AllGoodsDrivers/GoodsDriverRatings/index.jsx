/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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
  Card,
  Rating,
  Chip,
  Avatar,
  Tooltip,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast, ToastContainer } from "react-toastify";
import { styled } from "@mui/system";

import { useNavigate, useParams } from "react-router-dom";

import {
  Card as StrapCard,
  CardBody as StrapCardBody,
  Col,
  Container,
  Row,
} from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Cookies from "js-cookie";

import Loader from "../../../Loader";
import { serverEndPoint } from "../../../../../dashboard/app/constants";

const DriverRatingsPage = () => {
  const [loading, setLoading] = useState(true);
  const { driver_id, driver_name } = useParams();
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch driver ratings
  const fetchDriverRatings = async () => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your connection.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("authToken");

    try {
      setLoading(true);
      const response = await axios.post(
        `${serverEndPoint}/get_driver_ratings`,
        {
          driver_id: driver_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setRatings(response.data.ratings || []);
        setRatingSummary({
          total_ratings: response.data.total_ratings || 0,
          average_rating: response.data.average_rating || 0,
          rating_distribution: response.data.rating_distribution || {
            "5_star": 0,
            "4_star": 0,
            "3_star": 0,
            "2_star": 0,
            "1_star": 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching driver ratings:", error);
      toast.error("Failed to fetch driver ratings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch driver details
  const fetchDriverDetails = async () => {
    const token = Cookies.get("authToken");

    try {
      const response = await axios.post(
        `${serverEndPoint}/get_goods_driver_details`,
        {
          goods_driver_id: driver_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.result) {
        setDriverDetails(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
    }
  };

  useEffect(() => {
    fetchDriverRatings();
    fetchDriverDetails();
  }, [driver_id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const filteredRatings = ratings.filter(
    (rating) =>
      rating.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.rating_description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      rating.order_id.toString().includes(searchQuery)
  );

  const paginatedRatings = filteredRatings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} style={{ color: "#FFD700" }} />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalfIcon key="half" style={{ color: "#FFD700" }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarBorderIcon key={`empty-${i}`} style={{ color: "#FFD700" }} />
      );
    }

    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "success";
    if (rating >= 4.0) return "primary";
    if (rating >= 3.5) return "warning";
    if (rating >= 3.0) return "info";
    return "error";
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
            <div className="d-flex align-items-center mb-3">
              {/* <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => window.history.back()}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Back
              </Button> */}
              <h4 className="main-title mb-0">Driver Ratings & Reviews</h4>
            </div>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                  <span>
                    <i className="ph-duotone ph-stack f-s-16"></i> Goods Drivers
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="f-s-14 f-w-500">
                  {driver_name || "Driver"}
                </a>
              </li>
              <li className="active">
                <a href="#" className="f-s-14 f-w-500">
                  Ratings & Reviews
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Driver Summary Card */}
        {driverDetails && (
          <Row className="mb-4">
            <Col xs={12}>
              <StrapCard className="shadow-lg border-0 rounded-lg">
                <StrapCardBody>
                  <div className="d-flex align-items-center">
                    <div className="h-60 w-60 d-flex-center b-r-15 overflow-hidden p-1 me-3">
                      <img
                        src={
                          driverDetails.profile_pic ||
                          "/assets/images/avtar/16.png"
                        }
                        alt={driverDetails.driver_first_name}
                        className="img-fluid"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">
                        {driverDetails.driver_first_name}{" "}
                        {driverDetails.driver_last_name}
                      </h5>
                      <p className="mb-1 text-muted">
                        <i className="ti ti-phone me-2"></i>
                        {driverDetails.mobile_no}
                      </p>
                      <p className="mb-1 text-muted">
                        <i className="ti ti-truck me-2"></i>
                        {driverDetails.vehicle_name} |{" "}
                        {driverDetails.vehicle_plate_no}
                      </p>
                      <p className="mb-0 text-muted">
                        <i className="ti ti-calendar me-2"></i>
                        Registered: {driverDetails.registration_date}
                      </p>
                    </div>
                  </div>
                </StrapCardBody>
              </StrapCard>
            </Col>
          </Row>
        )}

        {/* Rating Summary Cards */}
        {ratingSummary && (
          <Row className="mb-4">
            <Col xs={12} md={3}>
              <StrapCard className="shadow-lg border-0 rounded-lg text-center">
                <StrapCardBody>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    {renderStars(ratingSummary.average_rating)}
                  </div>
                  <h3
                    className={`text-${getRatingColor(
                      ratingSummary.average_rating
                    )} mb-1`}
                  >
                    {ratingSummary.average_rating.toFixed(1)}
                  </h3>
                  <p className="text-muted mb-0">Average Rating</p>
                </StrapCardBody>
              </StrapCard>
            </Col>
            <Col xs={12} md={3}>
              <StrapCard className="shadow-lg border-0 rounded-lg text-center">
                <StrapCardBody>
                  <h3 className="text-primary mb-1">
                    {ratingSummary.total_ratings}
                  </h3>
                  <p className="text-muted mb-0">Total Reviews</p>
                </StrapCardBody>
              </StrapCard>
            </Col>
            <Col xs={12} md={3}>
              <StrapCard className="shadow-lg border-0 rounded-lg text-center">
                <StrapCardBody>
                  <h3 className="text-success mb-1">
                    {(ratingSummary.rating_distribution &&
                    ratingSummary.rating_distribution["5_star"]
                      ? ratingSummary.rating_distribution["5_star"]
                      : 0) +
                      (ratingSummary.rating_distribution &&
                      ratingSummary.rating_distribution["4_star"]
                        ? ratingSummary.rating_distribution["4_star"]
                        : 0)}
                  </h3>
                  <p className="text-muted mb-0">Positive Reviews</p>
                </StrapCardBody>
              </StrapCard>
            </Col>
            <Col xs={12} md={3}>
              <StrapCard className="shadow-lg border-0 rounded-lg text-center">
                <StrapCardBody>
                  <h3 className="text-warning mb-1">
                    {(ratingSummary.rating_distribution &&
                    ratingSummary.rating_distribution["1_star"]
                      ? ratingSummary.rating_distribution["1_star"]
                      : 0) +
                      (ratingSummary.rating_distribution &&
                      ratingSummary.rating_distribution["2_star"]
                        ? ratingSummary.rating_distribution["2_star"]
                        : 0)}
                  </h3>
                  <p className="text-muted mb-0">Negative Reviews</p>
                </StrapCardBody>
              </StrapCard>
            </Col>
          </Row>
        )}

        {/* Rating Distribution */}
        {ratingSummary && ratingSummary.rating_distribution && (
          <Row className="mb-4">
            <Col xs={12}>
              <StrapCard className="shadow-lg border-0 rounded-lg">
                <StrapCardBody>
                  <h6 className="mb-3">Rating Distribution</h6>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="d-flex align-items-center mb-2">
                      <div
                        className="d-flex align-items-center me-3"
                        style={{ width: "60px" }}
                      >
                        <span className="me-1">{star}</span>
                        <StarIcon
                          style={{ color: "#FFD700", fontSize: "16px" }}
                        />
                      </div>
                      <div className="flex-grow-1 me-3">
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: `${
                                ratingSummary.total_ratings > 0
                                  ? ((ratingSummary.rating_distribution[
                                      `${star}_star`
                                    ] || 0) /
                                      ratingSummary.total_ratings) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div style={{ width: "40px" }}>
                        <span className="text-muted">
                          {ratingSummary.rating_distribution[`${star}_star`] ||
                            0}
                        </span>
                      </div>
                    </div>
                  ))}
                </StrapCardBody>
              </StrapCard>
            </Col>
          </Row>
        )}

        {/* Ratings Table */}
        <Row>
          <Col xs={12}>
            <StrapCard className="shadow-lg border-0 rounded-lg">
              <StrapCardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Customer Reviews</h5>
                  <TextField
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{ width: 300 }}
                  />
                </div>

                {paginatedRatings.length === 0 ? (
                  <div className="text-center p-5">
                    <Typography variant="h6" color="textSecondary">
                      {searchQuery
                        ? "No reviews found matching your search"
                        : "No reviews found for this driver"}
                    </Typography>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Booking Details</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRatings.map((rating, index) => (
                            <tr key={rating.order_id}>
                              <td>
                                <Chip
                                  label={`#${rating.order_id}`}
                                  size="small"
                                  color="primary"
                                />
                              </td>
                              <td>
                                <div>
                                  <strong>{rating.customer_name}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {rating.customer_mobile}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {renderStars(rating.rating)}
                                  <span className="ms-2 fw-bold">
                                    {rating.rating}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div style={{ maxWidth: "300px" }}>
                                  <p className="mb-0 text-muted">
                                    {rating.rating_description}
                                  </p>
                                </div>
                              </td>
                              <td>
                                <div style={{ maxWidth: "250px" }}>
                                  <small className="text-muted">
                                    <strong>From:</strong>{" "}
                                    {rating.pickup_address}
                                  </small>
                                  <br />
                                  <small className="text-muted">
                                    <strong>To:</strong> {rating.drop_address}
                                  </small>
                                  <br />
                                  <small className="text-muted">
                                    <strong>Amount:</strong> ₹
                                    {rating.total_price}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(rating.booking_timing)}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <span className="text-muted">
                          Showing {page * rowsPerPage + 1} to{" "}
                          {Math.min(
                            (page + 1) * rowsPerPage,
                            filteredRatings.length
                          )}{" "}
                          of {filteredRatings.length} reviews
                        </span>
                      </div>
                      <div>
                        <Button
                          onClick={() => setPage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => setPage(page + 1)}
                          disabled={
                            (page + 1) * rowsPerPage >= filteredRatings.length
                          }
                          variant="outlined"
                          size="small"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </StrapCardBody>
            </StrapCard>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DriverRatingsPage;
