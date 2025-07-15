/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
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
  Spinner,
} from "reactstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  formatEpoch,
  mapKey,
  serverEndPoint,
} from "../../../../../dashboard/app/constants";
import Loader from "../../../Loader";

const GoodsDriverAllRides = () => {
  const { driverId, driverName } = useParams();
  const [activeTab, setActiveTab] = useState("ongoing-tab");
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);

  // Data states
  const [ongoingRides, setOngoingRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [cancelledRides, setCancelledRides] = useState([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ridesPerPage = 10;

  // Map states
  const [selectedRide, setSelectedRide] = useState(null);
  const [mapModal, setMapModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  // Cancel reason modal
  const [cancelReasonModal, setCancelReasonModal] = useState(false);
  const [selectedCancelledRide, setSelectedCancelledRide] = useState(null);

  const token = Cookies.get("authToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchRidesData();
  }, [driverId, activeTab, currentPage, searchQuery, startDate, endDate]);

  const fetchRidesData = async () => {
    try {
      setLoading(true);
      const status = getStatusFromTab(activeTab);

      const response = await axios.post(
        `${serverEndPoint}/get_driver_rides`,
        {
          driver_id: driverId,
          status: status,
          page: currentPage,
          limit: ridesPerPage,
          search: searchQuery,
          start_date: startDate,
          end_date: endDate,
        },
        config
      );

      if (response.data.status === "success") {
        const rides = response.data.rides || [];

        switch (activeTab) {
          case "ongoing-tab":
            setOngoingRides(rides);
            break;
          case "completed-tab":
            setCompletedRides(rides);
            break;
          case "cancelled-tab":
            setCancelledRides(rides);
            break;
        }

        setTotalCount(response.data.total_count || 0);
        setTotalPages(
          Math.ceil((response.data.total_count || 0) / ridesPerPage)
        );
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast.error("Failed to fetch rides data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromTab = (tab) => {
    switch (tab) {
      case "ongoing-tab":
        return "ongoing";
      case "completed-tab":
        return "completed";
      case "cancelled-tab":
        return "cancelled";
      default:
        return "all";
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchRidesData();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const getCurrentRides = () => {
    switch (activeTab) {
      case "ongoing-tab":
        return ongoingRides;
      case "completed-tab":
        return completedRides;
      case "cancelled-tab":
        return cancelledRides;
      default:
        return [];
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "warning", text: "Pending" },
      Accepted: { color: "info", text: "Accepted" },
      Started: { color: "primary", text: "Started" },
      Completed: { color: "success", text: "Completed" },
      Cancelled: { color: "danger", text: "Cancelled" },
      Rejected: { color: "secondary", text: "Rejected" },
    };

    const config = statusConfig[status] || { color: "light", text: status };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const handleViewMap = async (ride) => {
    setSelectedRide(ride);
    setMapModal(true);
    setMapLoading(true);

    // Load Google Maps API if not already loaded
    if (!window.google) {
      await loadGoogleMapsAPI();
    }

    setTimeout(() => {
      initializeMap(ride);
    }, 1000);
  };

  const loadGoogleMapsAPI = () => {
    return new Promise((resolve) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const initializeMap = (ride) => {
    try {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      // Initialize map
      const map = new window.google.maps.Map(mapContainer, {
        zoom: 12,
        center: {
          lat: parseFloat(ride.pickup_lat) || 0,
          lng: parseFloat(ride.pickup_lng) || 0,
        },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      // Initialize directions service
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#2196F3",
          strokeWeight: 4,
        },
      });

      directionsRenderer.setMap(map);

      // Store references
      mapInstanceRef.current = map;
      directionsServiceRef.current = directionsService;
      directionsRendererRef.current = directionsRenderer;

      // Add markers and route
      addMarkersAndRoute(map, ride, directionsService, directionsRenderer);

      setMapLoading(false);
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapLoading(false);
    }
  };

  const addMarkersAndRoute = (
    map,
    ride,
    directionsService,
    directionsRenderer
  ) => {
    const pickupLatLng = {
      lat: parseFloat(ride.pickup_lat),
      lng: parseFloat(ride.pickup_lng),
    };
    const destinationLatLng = {
      lat: parseFloat(ride.destination_lat),
      lng: parseFloat(ride.destination_lng),
    };

    // Add pickup marker
    new window.google.maps.Marker({
      position: pickupLatLng,
      map: map,
      title: "Pickup Location",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new window.google.maps.Size(32, 32),
      },
      label: {
        text: "P",
        color: "white",
        fontWeight: "bold",
      },
    });

    // Add destination marker
    new window.google.maps.Marker({
      position: destinationLatLng,
      map: map,
      title: "Destination",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(32, 32),
      },
      label: {
        text: "D",
        color: "white",
        fontWeight: "bold",
      },
    });

    // Calculate and display route
    const request = {
      origin: pickupLatLng,
      destination: destinationLatLng,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);

        // Fit bounds to show entire route
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs.forEach((leg) => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        map.fitBounds(bounds);
      }
    });
  };

  const handleViewCancelReason = (ride) => {
    setSelectedCancelledRide(ride);
    setCancelReasonModal(true);
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price || 0).toFixed(2)}`;
  };

  const formatDistance = (distance) => {
    return `${parseFloat(distance || 0).toFixed(2)} km`;
  };

  if (loading && !getCurrentRides().length) {
    return <Loader />;
  }

  return (
    <div>
      <ToastContainer position="top-right" />
      <Container fluid>
        <Row className="m-1">
          <Col xs={12}>
            <h4 className="main-title">Driver Rides - {driverName}</h4>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                  <span>
                    <i className="ph-duotone ph-truck f-s-16"></i> Goods Drivers
                  </span>
                </a>
              </li>
              <li className="active mt-2">
                <a href="#" className="f-s-14 f-w-500">
                  Rides History
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card className="shadow-lg border-0 rounded-lg">
              <CardBody>
                {/* Search and Filter Section */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <Input
                      type="text"
                      placeholder="Search by customer name, pickup, or drop location..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-2">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-2">
                    <Button color="primary" onClick={handleDateFilter}>
                      Filter
                    </Button>
                  </div>
                  <div className="col-md-2">
                    <Button color="secondary" onClick={clearFilters}>
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs app-tabs-primary order-tabs d-flex justify-content-start border-0 mb-0 pb-0">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link d-flex align-items-center gap-1 ${
                        activeTab === "ongoing-tab" ? "active" : ""
                      }`}
                      onClick={() => handleTabClick("ongoing-tab")}
                    >
                      <i className="ti ti-clock f-s-18 mg-b-3"></i>
                      Ongoing ({ongoingRides.length})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link d-flex align-items-center gap-1 ${
                        activeTab === "completed-tab" ? "active" : ""
                      }`}
                      onClick={() => handleTabClick("completed-tab")}
                    >
                      <i className="ti ti-check f-s-18 mg-b-3"></i>
                      Completed ({completedRides.length})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link d-flex align-items-center gap-1 ${
                        activeTab === "cancelled-tab" ? "active" : ""
                      }`}
                      onClick={() => handleTabClick("cancelled-tab")}
                    >
                      <i className="ti ti-x f-s-18 mg-b-3"></i>
                      Cancelled ({cancelledRides.length})
                    </button>
                  </li>
                </ul>
              </CardBody>

              {/* Rides Table */}
              <div className="card-body rides-tab-content p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Pickup Location</th>
                        <th>Drop Location</th>
                        <th>Distance</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentRides().map((ride) => (
                        <tr key={ride.booking_id}>
                          <td>
                            <strong>#{ride.booking_id}</strong>
                          </td>
                          <td>
                            <div>
                              <h6 className="mb-0 f-s-14">
                                {ride.sender_name || "N/A"}
                              </h6>
                              <p className="mb-0 f-s-12 text-secondary">
                                {ride.sender_number || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td>
                            <p className="mb-0 f-s-12 text-secondary">
                              {ride.pickup_address || "N/A"}
                            </p>
                          </td>
                          <td>
                            <p className="mb-0 f-s-12 text-secondary">
                              {ride.drop_address || "N/A"}
                            </p>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {formatDistance(ride.distance)}
                            </span>
                          </td>
                          <td>
                            <strong className="text-success">
                              {formatPrice(ride.total_price)}
                            </strong>
                          </td>
                          <td>{getStatusBadge(ride.booking_status)}</td>
                          <td>
                            <p className="mb-0 f-s-12">
                              {formatEpoch(ride.booking_timing)}
                            </p>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => handleViewMap(ride)}
                                className="me-1"
                              >
                                <i className="ti ti-map-pin"></i>
                              </Button>
                              {ride.booking_status === "Cancelled" && (
                                <Button
                                  color="warning"
                                  size="sm"
                                  onClick={() => handleViewCancelReason(ride)}
                                >
                                  <i className="ti ti-info-circle"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {getCurrentRides().length === 0 && (
                    <div className="text-center py-4">
                      <i className="ti ti-truck-delivery f-s-48 text-muted"></i>
                      <p className="mt-2 text-muted">No rides found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3">
                    <div>
                      Showing {(currentPage - 1) * ridesPerPage + 1} to{" "}
                      {Math.min(currentPage * ridesPerPage, totalCount)} of{" "}
                      {totalCount} rides
                    </div>
                    <div className="btn-group">
                      <Button
                        color="outline-primary"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button color="outline-primary" disabled>
                        Page {currentPage} of {totalPages}
                      </Button>
                      <Button
                        color="outline-primary"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Map Modal */}
      <Modal
        isOpen={mapModal}
        toggle={() => setMapModal(!mapModal)}
        size="lg"
        className="modal-fullscreen-lg-down"
      >
        <ModalHeader toggle={() => setMapModal(!mapModal)}>
          Route Map - Booking #{selectedRide?.booking_id}
        </ModalHeader>
        <ModalBody>
          {mapLoading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">Loading map...</p>
            </div>
          ) : (
            <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
          )}
          {selectedRide && (
            <div className="mt-3">
              <div className="row">
                <div className="col-md-6">
                  <h6>Pickup Location:</h6>
                  <p className="text-muted">{selectedRide.pickup_address}</p>
                </div>
                <div className="col-md-6">
                  <h6>Drop Location:</h6>
                  <p className="text-muted">{selectedRide.drop_address}</p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Cancel Reason Modal */}
      <Modal
        isOpen={cancelReasonModal}
        toggle={() => setCancelReasonModal(!cancelReasonModal)}
        size="md"
      >
        <ModalHeader toggle={() => setCancelReasonModal(!cancelReasonModal)}>
          Cancellation Details
        </ModalHeader>
        <ModalBody>
          {selectedCancelledRide && (
            <div>
              <Alert color="warning">
                <strong>Booking #{selectedCancelledRide.booking_id}</strong>
              </Alert>
              <div className="mb-3">
                <strong>Cancel Reason:</strong>
                <p className="text-muted">
                  {selectedCancelledRide.cancelled_reason ||
                    "No reason provided"}
                </p>
              </div>
              <div className="mb-3">
                <strong>Cancelled On:</strong>
                <p className="text-muted">
                  {formatEpoch(selectedCancelledRide.cancel_time)}
                </p>
              </div>
              <div className="mb-3">
                <strong>Customer:</strong>
                <p className="text-muted">
                  {selectedCancelledRide.sender_name} (
                  {selectedCancelledRide.sender_number})
                </p>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default GoodsDriverAllRides;
