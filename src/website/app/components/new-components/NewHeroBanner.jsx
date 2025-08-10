/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  LocationOn,
  FlagOutlined,
  Person,
  Phone,
  LocationCity,
  ArrowForward,
  KeyboardArrowDown,
  Person2Rounded,
} from "@mui/icons-material";
import LocationSearchingOutlinedIcon from "@mui/icons-material/LocationSearchingOutlined";
import { LoadingButton } from "@mui/lab";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useLoadScript } from "@react-google-maps/api";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import ContentLoader from "react-content-loader";
import {
  serverWebsiteEndPoint,
  mapKey,
} from "../../../../dashboard/app/constants";

const libraries = ["places"];

const NewHeroBanner = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedCityCoveredDistance, setSelectedCityCoveredDistance] =
    useState(0);
  const [bgImage, setBgImage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [pickupPlaceId, setPickupPlaceId] = useState(null);
  const [dropPlaceId, setDropPlaceId] = useState(null);
  const [hover, setHover] = useState(false);

  const pickupInputRef = useRef(null);
  const dropInputRef = useRef(null);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Load Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapKey,
    libraries,
  });

  // Toggle modal visibility
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const fetchAllServices = async () => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your connection.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${serverWebsiteEndPoint}/all_services`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
          },
        }
      );
      setServices(response.data.services_details || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your connection.");
      return;
    }

    try {
      const response = await axios.post(
        `${serverWebsiteEndPoint}/all_allowed_cities`
      );
      setCities(response.data.cities);

      if (response.data.cities && response.data.cities.length > 0) {
        const firstCity = response.data.cities[0];
        setBgImage(firstCity.bg_image);
        setSelectedCity(firstCity.city_name);
        setSelectedCityId(firstCity.city_id);
        setSelectedCityCoveredDistance(firstCity.covered_distance);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        toast.error("No Data Found.");
        setError("No Data Found");
      } else if (error.response.status === 500) {
        toast.error("Internal server error. Please try again later.");
        setError("Internal Server Error");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
        setError("Unexpected Error");
      }
    } else {
      toast.error("Failed to fetch services. Please check your connection.");
      setError(error);
    }
    setLoading(false);
  };

  const handleServiceClick = (service) => {
    // Check if service name contains "Coming Soon"
    if (
      service.category_name &&
      service.category_name.toLowerCase().includes("coming soon")
    ) {
      toast.info("Coming Soon!");
      return;
    }

    if (service.category_id === 1 || service.category_id === 2) {
      navigate("/get_estimation", {
        state: { service: service },
      });
    } else if (service.category_id === 3) {
      navigate("/get_jcb_estimation", {
        state: { service: service },
      });
    } else if (service.category_id === 4) {
      navigate("/get_drivers_estimation", {
        state: { service: service },
      });
    } else {
      navigate("/get_handy_man_estimation", {
        state: { service: service },
      });
    }
  };

  const fetchDistance = async (pickupPlaceId, dropPlaceId) => {
    try {
      const response = await fetch(
        `${serverWebsiteEndPoint}/distance?origins=${pickupPlaceId}&destinations=${dropPlaceId}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.rows && data.rows.length > 0) {
        const distance = data.rows[0].elements[0].distance.text;
        const numericDistance = parseFloat(distance.replace(" km", ""));

        if (numericDistance > selectedCityCoveredDistance) {
          toast.warning(
            `The distance (${numericDistance} km) exceeds the covered distance (${selectedCityCoveredDistance} km) for this city.`
          );
          handleRegister("outstation", numericDistance);
        } else {
          toast.success(`Distance is ${numericDistance} km`);
          handleRegister("local", numericDistance);
        }
      } else {
        toast.error("Unable to calculate the distance.");
      }
    } catch (error) {
      console.error("Error fetching distance:", error);
      toast.error("Error fetching distance data.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegister = async (request_type, numericDistance) => {
    // Use the first available service as default for general booking
    const defaultService =
      services.length > 0
        ? services[0]
        : { category_id: 1, category_name: "Transport" };

    const payload = {
      category_id: defaultService.category_id,
      start_address: pickupLocation,
      end_address: dropLocation,
      name: contactName,
      mobile_no: contactNumber,
      purpose: purpose,
      city_id: selectedCityId,
      request_type: request_type,
    };

    try {
      const response = await axios.post(
        `${serverWebsiteEndPoint}/add_new_estimation_request`,
        payload
      );

      if (response.status === 200) {
        toast.success("Estimation Request Sent Successfully!");
        navigate(
          `/fare_estimation_result/${selectedCityId}/${defaultService.category_id}/${numericDistance}/${defaultService.category_name}`
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle when a pickup location is selected
  const handlePickupSelect = (placeId) => {
    setPickupPlaceId(placeId);
  };

  // Handle when a drop location is selected
  const handleDropSelect = (placeId) => {
    setDropPlaceId(placeId);
  };

  const handlePickupSuggestionClick = (suggestion) => {
    handlePickupSelect(suggestion.place_id);
    setPickupLocation(suggestion.description);
    setPickupSuggestions([]);
  };

  const handleDropSuggestionClick = (suggestion) => {
    handleDropSelect(suggestion.place_id);
    setDropLocation(suggestion.description);
    setDropSuggestions([]);
  };

  // Handle city click
  const handleCityClick = (city) => {
    setSelectedCity(city.city_name);
    setSelectedCityId(city.city_id);
    setSelectedCityCoveredDistance(city.covered_distance);
    setBgImage(city.bg_image);
    toggleModal();
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    pickupLocation: Yup.string().required("Pickup Location is required!"),
    dropLocation: Yup.string().required("Drop Location is required!"),
    contactName: Yup.string().required("Full Name is required!"),
    contactNumber: Yup.string()
      .required("Phone Number is required!")
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(10, "Phone number must be exactly 10 digits")
      .max(10, "Phone number must be exactly 10 digits"),
    purpose: Yup.string().required("Please select the Purpose"),
  });

  const initialValues = {
    pickupLocation: "",
    dropLocation: "",
    contactName: "",
    contactNumber: "",
    purpose: "",
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    if (!pickupPlaceId || !dropPlaceId) {
      toast.error(
        "Please select valid pickup and drop locations from suggestions"
      );
      return;
    }

    setFormLoading(true);
    fetchDistance(pickupPlaceId, dropPlaceId);
  };

  useEffect(() => {
    fetchAllServices();
    fetchCities();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const imageElement = document.getElementById("lazy-bg-image");
    if (imageElement) {
      observer.observe(imageElement);
    }

    return () => {
      if (imageElement) {
        observer.unobserve(imageElement);
      }
    };
  }, []);

  // Google Places autocomplete setup
  useEffect(() => {
    if (isLoaded) {
      const autocompleteService =
        new window.google.maps.places.AutocompleteService();

      const handlePickupInputChange = (e) => {
        const input = e.target.value;
        setPickupLocation(input);

        if (input.length > 0) {
          autocompleteService.getPlacePredictions(
            { input },
            (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setPickupSuggestions(predictions);
              } else {
                setPickupSuggestions([]);
              }
            }
          );
        } else {
          setPickupSuggestions([]);
        }
      };

      const handleDropInputChange = (e) => {
        const input = e.target.value;
        setDropLocation(input);

        if (input.length > 0) {
          autocompleteService.getPlacePredictions(
            { input },
            (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setDropSuggestions(predictions);
              } else {
                setDropSuggestions([]);
              }
            }
          );
        } else {
          setDropSuggestions([]);
        }
      };

      const pickupInputElement = pickupInputRef.current;
      const dropInputElement = dropInputRef.current;

      if (pickupInputElement && dropInputElement) {
        pickupInputElement.addEventListener("input", handlePickupInputChange);
        dropInputElement.addEventListener("input", handleDropInputChange);

        return () => {
          pickupInputElement.removeEventListener(
            "input",
            handlePickupInputChange
          );
          dropInputElement.removeEventListener("input", handleDropInputChange);
        };
      }
    }
  }, [isLoaded]);

  const ServiceCard = ({ service }) => (
    <Box
      onClick={() => handleServiceClick(service)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        padding: 2,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          width: isMobile ? 80 : 180,
          height: isMobile ? 80 : 180,
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={service.category_image || service.website_background_image}
          alt={service.category_name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          loading="lazy"
        />
      </Box>
      <Typography
        variant={isMobile ? "body2" : "body1"}
        fontWeight="600"
        textAlign="center"
        color="#333"
        sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
      >
        {service.category_name}
      </Typography>
    </Box>
  );

  const LoadingSkeleton = () => (
    <ContentLoader
      speed={2}
      width="100%"
      height={isMobile ? 120 : 150}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <circle
        cx={isMobile ? "30" : "40"}
        cy={isMobile ? "30" : "40"}
        r={isMobile ? "25" : "35"}
      />
      <rect
        x={isMobile ? "10" : "15"}
        y={isMobile ? "70" : "90"}
        rx="4"
        ry="4"
        width={isMobile ? "40" : "50"}
        height="12"
      />
    </ContentLoader>
  );

  return (
    <>
      <section
        className="relative w-full lg:h-[40rem] h-[30rem] flex items-center justify-center bg-cover bg-center bg-no-repeat lg:mb-[2rem] mb-[14rem]"
        style={{
          backgroundImage: isVisible ? `url(${bgImage})` : "none",
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 flex lg:flex-row flex-col lg:justify-between justify-center w-full lg:p-10 p-2 lg:mt-0 mt-[10rem] items-center lg:mb-0 mb-[-8rem]">
          <div className="flex flex-col lg:items-start items-center w-full">
            <h1 className="text-white lg:text-5xl text-lg font-titillium">
              Welcome to KAPS
            </h1>
            <p className="text-white lg:text-2xl text-sm mt-4">
              Reliable Transport & Vendor Services
            </p>
          </div>

          {/* LocationForm - Exact Match */}
          <div className="relative flex items-center justify-center h-full w-full lg:mt-0 mt-[0rem]">
            <Box className="bg-white p-8 shadow-lg rounded-sm w-full lg:max-w-[30rem] max-w-[30rem] max-h-[38rem] lg:mt-0 mt-5">
              {/* City Selector */}
              <div>
                <div
                  className="flex justify-start items-center rounded-md cursor-pointer"
                  onClick={toggleModal}
                >
                  <div className="flex items-center justify-start mb-1 pb-4">
                    <LocationSearchingOutlinedIcon
                      style={{ fontSize: "16px", fontWeight: "bold" }}
                    />
                    <p className="ml-2 font-titillium">{selectedCity}</p>
                    <KeyboardArrowDown
                      style={{ fontSize: "18px", marginLeft: "5px" }}
                    />
                  </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                  <div className="fixed bg-white inset-0 bg-opacity-50 flex justify-center shadow-lg items-center z-20 p-6">
                    <div className="bg-white p-6 rounded-lg w-full lg:w-1/2 shadow-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg text-black text-center mb-4">
                          Select your City
                        </h3>
                        <FiX
                          className="text-2xl text-black cursor-pointer"
                          onClick={toggleModal}
                        />
                      </div>
                      <ul className="flex gap-4 justify-evenly flex-wrap">
                        {cities.map((city, index) => (
                          <li
                            key={index}
                            className="flex flex-col justify-center w-fit items-center mb-3 p-2 rounded-md cursor-pointer"
                            onClick={() => handleCityClick(city)}
                          >
                            <Tilt className="w-full">
                              <motion.div
                                variants={{
                                  hidden: { opacity: 0 },
                                  visible: {
                                    opacity: 1,
                                    transition: { delay: index * 0.1 },
                                  },
                                }}
                                initial="hidden"
                                animate="visible"
                                className="w-full p-[1px] rounded-[20px]"
                              >
                                <div className="bg-white rounded-[20px] p-1 flex justify-evenly items-center flex-col">
                                  <img
                                    src={city.bg_image}
                                    alt={city.city_name}
                                    className="sm:w-14 sm:h-14 w-10 h-10 rounded-md m-1"
                                  />
                                </div>
                              </motion.div>
                            </Tilt>
                            <span className="text-gray mt-2 text-[12px]">
                              {city.city_name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Formik
                onSubmit={handleFormSubmit}
                validationSchema={validationSchema}
                initialValues={initialValues}
              >
                {({ values, errors, touched, handleBlur, handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    {/* Pickup Location Search */}
                    <div className="relative flex flex-col">
                      <TextField
                        fullWidth
                        ref={pickupInputRef}
                        id="pickup_location"
                        label="Pickup Location"
                        margin="dense"
                        variant="outlined"
                        autoComplete="off"
                        placeholder="Enter your Pickup Location"
                        value={pickupLocation}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          if (e.target.value) {
                            values.pickupLocation = pickupLocation;
                          }
                        }}
                        size={isMobile ? "small" : "medium"}
                        className="mb-4"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn
                                style={{ color: "gray", fontSize: "14px" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        onBlur={handleBlur}
                        helperText={
                          touched.pickupLocation && errors.pickupLocation
                        }
                        error={Boolean(
                          errors.pickupLocation && touched.pickupLocation
                        )}
                      />

                      {/* Custom Suggestions List for Pickup Location */}
                      {pickupSuggestions.length > 0 && (
                        <ul className="absolute bg-white shadow-md mt-[3rem] rounded-md z-20">
                          {pickupSuggestions.map((suggestion) => (
                            <li
                              key={suggestion.place_id}
                              className="p-2 cursor-pointer hover:bg-gray-200"
                              onClick={() =>
                                handlePickupSuggestionClick(suggestion)
                              }
                            >
                              <span className="text-[10px]">
                                {suggestion.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Drop Location */}
                    <div className="relative flex flex-col">
                      <TextField
                        fullWidth
                        ref={dropInputRef}
                        id="drop_location"
                        label="Drop Location"
                        placeholder="Enter your Drop Location"
                        type="text"
                        margin="dense"
                        autoComplete="off"
                        size={isMobile ? "small" : "medium"}
                        value={dropLocation}
                        onChange={(e) => {
                          setDropLocation(e.target.value);
                          if (e.target.value) {
                            values.dropLocation = dropLocation;
                          }
                        }}
                        variant="outlined"
                        className="mb-4"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationCity
                                style={{ color: "gray", fontSize: "14px" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        onBlur={handleBlur}
                        helperText={touched.dropLocation && errors.dropLocation}
                        error={Boolean(
                          errors.dropLocation && touched.dropLocation
                        )}
                      />

                      {/* Custom Suggestions List for Drop Location */}
                      {dropSuggestions.length > 0 && (
                        <ul className="absolute bg-white shadow-md mt-[3rem] rounded-md z-20">
                          {dropSuggestions.map((suggestion) => (
                            <li
                              key={suggestion.place_id}
                              className="p-2 cursor-pointer hover:bg-gray-200"
                              onClick={() =>
                                handleDropSuggestionClick(suggestion)
                              }
                            >
                              <span className="text-[10px]">
                                {suggestion.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Customer Name */}
                    <TextField
                      fullWidth
                      id="contact_name"
                      label="Full Name"
                      placeholder="Enter your Full Name"
                      type="text"
                      margin="dense"
                      size={isMobile ? "small" : "medium"}
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        if (e.target.value) {
                          values.contactName = contactName;
                        }
                      }}
                      variant="outlined"
                      autoComplete="off"
                      className="mb-4"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person2Rounded
                              style={{ color: "gray", fontSize: "14px" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      onBlur={handleBlur}
                      helperText={touched.contactName && errors.contactName}
                      error={Boolean(errors.contactName && touched.contactName)}
                    />

                    {/* Customer Contact Number */}
                    <div className="block mb-2">
                      <TextField
                        fullWidth
                        id="contact_number"
                        label="Phone Number"
                        autoComplete="off"
                        placeholder="Enter your phone number"
                        type="tel"
                        margin="dense"
                        size={isMobile ? "small" : "medium"}
                        value={contactNumber}
                        onChange={(e) => {
                          setContactNumber(e.target.value);
                          if (e.target.value) {
                            values.contactNumber = e.target.value;
                          }
                        }}
                        variant="outlined"
                        className="mb-4"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone
                                style={{ color: "gray", fontSize: "14px" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        onBlur={handleBlur}
                        helperText={
                          touched.contactNumber && errors.contactNumber
                        }
                        error={Boolean(
                          errors.contactNumber && touched.contactNumber
                        )}
                      />
                    </div>

                    {/* Purpose Dropdown */}
                    <FormControl
                      fullWidth
                      className="mb-6"
                      size={isMobile ? "small" : "medium"}
                      error={Boolean(errors.purpose && touched.purpose)}
                    >
                      <InputLabel id="purpose-label">Purpose</InputLabel>
                      <Select
                        labelId="purpose-label"
                        id="purpose"
                        label="Purpose"
                        value={purpose}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          values.purpose = selectedValue;
                          setPurpose(selectedValue);
                        }}
                        onBlur={handleBlur}
                      >
                        <MenuItem value="personal">Personal</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                      </Select>
                      {touched.purpose && errors.purpose && (
                        <FormHelperText>{errors.purpose}</FormHelperText>
                      )}
                    </FormControl>

                    {/* Register Button */}
                    <div className="flex items-center justify-center mt-4">
                      <LoadingButton
                        type="submit"
                        color="primary"
                        loading={formLoading}
                        variant="contained"
                        sx={{ my: 2 }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        Get An Estimation For Transport Service
                        <ArrowForward
                          style={{
                            fontSize: hover ? "28px" : "20px",
                            marginLeft: "8px",
                            transition: "font-size 0.2s ease",
                          }}
                        />
                      </LoadingButton>
                    </div>
                  </form>
                )}
              </Formik>
            </Box>
          </div>
        </div>
      </section>

      {/* Placeholder for Intersection Observer */}
      <div id="lazy-bg-image" style={{ height: "1px", visibility: "hidden" }} />

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box textAlign="center" mb={4}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight="bold"
            color="#333"
            sx={{
              fontFamily: "titillium",
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 4,
                backgroundColor: "#FFC107",
                borderRadius: 2,
              },
            }}
          >
            Our Services
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={isMobile ? 2 : 3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={4} lg={2} md={2} key={index}>
                <LoadingSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Box textAlign="center" py={4}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchAllServices}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
            {services.map((service, index) => (
              <Grid
                item
                xs={3}
                sm={2}
                md={2}
                key={service.category_id || index}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ServiceCard service={service} />
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && services.length === 0 && !error && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              No services available at the moment
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default NewHeroBanner;
