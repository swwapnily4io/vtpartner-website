/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { LocationOn, FlagOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import ContentLoader from "react-content-loader";
import { serverWebsiteEndPoint } from "../../../../dashboard/app/constants";

const NewHeroBanner = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const handleBookRide = () => {
    if (!pickupLocation.trim()) {
      toast.error("Please enter pickup location");
      return;
    }
    if (!dropLocation.trim()) {
      toast.error("Please enter drop location");
      return;
    }
    toast.success("Coming Soon!"); // Placeholder for booking functionality
    return;
    // Navigate to booking flow with locations
    // navigate("/book-ride", {
    //   state: {
    //     pickupLocation,
    //     dropLocation,
    //   },
    // });
  };

  useEffect(() => {
    fetchAllServices();
  }, []);

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
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 4, md: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography
              variant={isMobile ? "h4" : "h2"}
              fontWeight="bold"
              mb={2}
              sx={{
                fontFamily: "titillium",
                fontSize: { xs: "2rem", md: "3.5rem" },
              }}
            >
              Welcome to Kaps
            </Typography>
          </Box>

          {/* Booking Form */}
          <Box
            sx={{
              maxWidth: 600,
              mx: "auto",
              backgroundColor: "white",
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Enter Pickup Location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: "#4CAF50" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#f8f9fa",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4CAF50",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4CAF50",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                placeholder="Enter Drop Location"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagOutlined sx={{ color: "#f44336" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#f8f9fa",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#f44336",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#f44336",
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleBookRide}
                sx={{
                  backgroundColor: "#FFC107",
                  color: "#000",
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: "bold",
                  borderRadius: 2,
                  mt: 1,
                  "&:hover": {
                    backgroundColor: "#FFB300",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Book Ride
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

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
    </Box>
  );
};

export default NewHeroBanner;

//

/* eslint-disable no-unused-vars */
/*
 * Required dependencies:
 * npm install @react-google-maps/api formik yup @mui/lab
 *
 * Make sure to add your Google Maps API key to constants.js as 'mapKey'
 */
// import React, { useEffect, useState, useRef } from "react";
// import {
//   Box,
//   Container,
//   Typography,
//   Grid,
//   Button,
//   TextField,
//   InputAdornment,
//   Card,
//   CardContent,
//   useTheme,
//   useMediaQuery,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   FormHelperText,
//   Autocomplete,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
// } from "@mui/material";
// import { LocationOn, FlagOutlined, Person, Phone, KeyboardArrowDown } from "@mui/icons-material";
// import { LoadingButton } from "@mui/lab";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import axios from "axios";
// import ContentLoader from "react-content-loader";
// import { useLoadScript } from "@react-google-maps/api";
// import { Formik } from "formik";
// import * as Yup from "yup";
// import { serverWebsiteEndPoint, mapKey } from "../../../../dashboard/app/constants";

// const libraries = ["places"];

// const NewHeroBanner = () => {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formLoading, setFormLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [pickupLocation, setPickupLocation] = useState("");
//   const [dropLocation, setDropLocation] = useState("");
//   const [contactName, setContactName] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [purpose, setPurpose] = useState("");
//   const [cities, setCities] = useState([]);
//   const [selectedCity, setSelectedCity] = useState("");
//   const [selectedCityId, setSelectedCityId] = useState(null);
//   const [selectedCityCoveredDistance, setSelectedCityCoveredDistance] = useState(0);

//   // Google Places API states
//   const [pickupSuggestions, setPickupSuggestions] = useState([]);
//   const [dropSuggestions, setDropSuggestions] = useState([]);
//   const [pickupPlaceId, setPickupPlaceId] = useState(null);
//   const [dropPlaceId, setDropPlaceId] = useState(null);

//   const pickupInputRef = useRef(null);
//   const dropInputRef = useRef(null);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   // Load Google Maps script
//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: mapKey,
//     libraries,
//   });

//   // Form validation schema
//   const validationSchema = Yup.object().shape({
//     pickupLocation: Yup.string().required("Pickup Location is required!"),
//     dropLocation: Yup.string().required("Drop Location is required!"),
//     contactName: Yup.string().required("Full Name is required!"),
//     contactNumber: Yup.string()
//       .required("Phone Number is required!")
//       .matches(/^[0-9]+$/, "Phone number must contain only digits")
//       .min(10, "Phone number must be exactly 10 digits")
//       .max(10, "Phone number must be exactly 10 digits"),
//     purpose: Yup.string().required("Please select the Purpose"),
//   });

//   const initialValues = {
//     pickupLocation: "",
//     dropLocation: "",
//     contactName: "",
//     contactNumber: "",
//     purpose: "",
//   };

//   const fetchAllServices = async () => {
//     if (!navigator.onLine) {
//       toast.error("No internet connection. Please check your connection.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${serverWebsiteEndPoint}/all_services`,
//         {},
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json; charset=UTF-8",
//           },
//         }
//       );
//       setServices(response.data.services_details || []);
//     } catch (error) {
//       handleError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCities = async () => {
//     if (!navigator.onLine) {
//       toast.error("No internet connection. Please check your connection.");
//       return;
//     }

//     try {
//       const response = await axios.post(`${serverWebsiteEndPoint}/all_allowed_cities`);
//       setCities(response.data.cities);

//       if (response.data.cities.length > 0) {
//         const firstCity = response.data.cities[0];
//         setSelectedCity(firstCity.city_name);
//         setSelectedCityId(firstCity.city_id);
//         setSelectedCityCoveredDistance(firstCity.covered_distance);
//       }
//     } catch (error) {
//       handleError(error);
//     }
//   };

//   const fetchDistance = async (pickupPlaceId, dropPlaceId, selectedService) => {
//     try {
//       const response = await fetch(
//         `${serverWebsiteEndPoint}/distance?origins=${pickupPlaceId}&destinations=${dropPlaceId}`
//       );

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status} - ${response.statusText}`);
//       }

//       const data = await response.json();

//       if (data && data.rows && data.rows.length > 0) {
//         const distance = data.rows[0].elements[0].distance.text;
//         const numericDistance = parseFloat(distance.replace(" km", ""));

//         if (numericDistance > selectedCityCoveredDistance) {
//           toast.warning(
//             `The distance (${numericDistance} km) exceeds the covered distance (${selectedCityCoveredDistance} km) for this city.`
//           );
//           handleRegister("outstation", numericDistance, selectedService);
//         } else {
//           toast.success(`Distance is ${numericDistance} km`);
//           handleRegister("local", numericDistance, selectedService);
//         }
//       } else {
//         toast.error("Unable to calculate the distance.");
//       }
//     } catch (error) {
//       console.error("Error fetching distance:", error);
//       toast.error("Error fetching distance data.");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleRegister = async (request_type, numericDistance, selectedService) => {
//     const payload = {
//       category_id: selectedService.category_id,
//       start_address: pickupLocation,
//       end_address: dropLocation,
//       name: contactName,
//       mobile_no: contactNumber,
//       purpose: purpose,
//       city_id: selectedCityId,
//       request_type: request_type,
//     };

//     try {
//       const response = await axios.post(
//         `${serverWebsiteEndPoint}/add_new_estimation_request`,
//         payload
//       );

//       if (response.status === 200) {
//         toast.success("Estimation Request Sent Successfully!");
//         navigate(
//           `/fare_estimation_result/${selectedCityId}/${selectedService.category_id}/${numericDistance}/${selectedService.category_name}`
//         );
//       }
//     } catch (error) {
//       handleError(error);
//     }
//   };

//   const handleError = (error) => {
//     if (error.response) {
//       if (error.response.status === 404) {
//         toast.error("No Data Found.");
//         setError("No Data Found");
//       } else if (error.response.status === 500) {
//         toast.error("Internal server error. Please try again later.");
//         setError("Internal Server Error");
//       } else {
//         toast.error("An unexpected error occurred. Please try again.");
//         setError("Unexpected Error");
//       }
//     } else {
//       toast.error("Failed to fetch services. Please check your connection.");
//       setError(error);
//     }
//     setLoading(false);
//   };

//   const handleServiceClick = (service) => {
//     // Check if form has required data
//     if (!pickupLocation.trim() || !dropLocation.trim() || !contactName.trim() || !contactNumber.trim() || !purpose) {
//       toast.warning("Please fill in all the booking details in the form above first, then select a service.");
//       // Scroll to form
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     if (!pickupPlaceId || !dropPlaceId) {
//       toast.error("Please select valid pickup and drop locations from suggestions");
//       return;
//     }

//     setFormLoading(true);
//     fetchDistance(pickupPlaceId, dropPlaceId, service);
//   };

//   const handleFormSubmit = async (values, { resetForm }) => {
//     setFormLoading(true);

//     // For general booking (not service-specific), just navigate to a booking page
//     if (!pickupPlaceId || !dropPlaceId) {
//       toast.error("Please select valid pickup and drop locations from suggestions");
//       setFormLoading(false);
//       return;
//     }

//     // If this is for a specific service, use the first available service as default
//     if (services.length > 0) {
//       const defaultService = services[0]; // Use first service as default
//       fetchDistance(pickupPlaceId, dropPlaceId, defaultService);
//     } else {
//       toast.error("No services available");
//       setFormLoading(false);
//     }
//   };

//   const handlePickupSuggestionClick = (suggestion) => {
//     setPickupPlaceId(suggestion.place_id);
//     setPickupLocation(suggestion.description);
//     setPickupSuggestions([]);
//   };

//   const handleDropSuggestionClick = (suggestion) => {
//     setDropPlaceId(suggestion.place_id);
//     setDropLocation(suggestion.description);
//     setDropSuggestions([]);
//   };

//   // Google Places autocomplete setup
//   useEffect(() => {
//     if (isLoaded) {
//       const autocompleteService = new window.google.maps.places.AutocompleteService();

//       const handlePickupInputChange = (e) => {
//         const input = e.target.value;
//         setPickupLocation(input);

//         if (input.length > 0) {
//           autocompleteService.getPlacePredictions(
//             { input },
//             (predictions, status) => {
//               if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//                 setPickupSuggestions(predictions);
//               } else {
//                 setPickupSuggestions([]);
//               }
//             }
//           );
//         } else {
//           setPickupSuggestions([]);
//         }
//       };

//       const handleDropInputChange = (e) => {
//         const input = e.target.value;
//         setDropLocation(input);

//         if (input.length > 0) {
//           autocompleteService.getPlacePredictions(
//             { input },
//             (predictions, status) => {
//               if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//                 setDropSuggestions(predictions);
//               } else {
//                 setDropSuggestions([]);
//               }
//             }
//           );
//         } else {
//           setDropSuggestions([]);
//         }
//       };

//       const pickupInputElement = pickupInputRef.current;
//       const dropInputElement = dropInputRef.current;

//       if (pickupInputElement && dropInputElement) {
//         pickupInputElement.addEventListener("input", handlePickupInputChange);
//         dropInputElement.addEventListener("input", handleDropInputChange);

//         return () => {
//           pickupInputElement.removeEventListener("input", handlePickupInputChange);
//           dropInputElement.removeEventListener("input", handleDropInputChange);
//         };
//       }
//     }
//   }, [isLoaded]);

//   useEffect(() => {
//     fetchAllServices();
//     fetchCities();
//   }, []);

//   const ServiceCard = ({ service }) => (
//     <Box
//       onClick={() => handleServiceClick(service)}
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         cursor: formLoading ? "not-allowed" : "pointer",
//         padding: 2,
//         borderRadius: 2,
//         transition: "all 0.3s ease",
//         opacity: formLoading ? 0.6 : 1,
//         "&:hover": {
//           backgroundColor: formLoading ? "transparent" : "#f5f5f5",
//           transform: formLoading ? "none" : "translateY(-2px)",
//         },
//         position: "relative",
//       }}
//     >
//       <Box
//         sx={{
//           width: isMobile ? 80 : 180,
//           height: isMobile ? 80 : 180,
//           mb: 1,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <img
//           src={service.category_image || service.website_background_image}
//           alt={service.category_name}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "contain",
//           }}
//           loading="lazy"
//         />
//       </Box>
//       <Typography
//         variant={isMobile ? "body2" : "body1"}
//         fontWeight="600"
//         textAlign="center"
//         color="#333"
//         sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
//       >
//         {service.category_name}
//       </Typography>

//       {formLoading && (
//         <Box
//           sx={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: "rgba(255, 255, 255, 0.8)",
//             borderRadius: 2,
//           }}
//         >
//           <ContentLoader
//             speed={2}
//             width={40}
//             height={40}
//             backgroundColor="#f3f3f3"
//             foregroundColor="#ecebeb"
//           >
//             <circle cx="20" cy="20" r="18" />
//           </ContentLoader>
//         </Box>
//       )}
//     </Box>
//   );

//   const LoadingSkeleton = () => (
//     <ContentLoader
//       speed={2}
//       width="100%"
//       height={isMobile ? 120 : 150}
//       backgroundColor="#f3f3f3"
//       foregroundColor="#ecebeb"
//     >
//       <circle
//         cx={isMobile ? "30" : "40"}
//         cy={isMobile ? "30" : "40"}
//         r={isMobile ? "25" : "35"}
//       />
//       <rect
//         x={isMobile ? "10" : "15"}
//         y={isMobile ? "70" : "90"}
//         rx="4"
//         ry="4"
//         width={isMobile ? "40" : "50"}
//         height="12"
//       />
//     </ContentLoader>
//   );

//   return (
//     <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       {/* Hero Section */}
//       <Box
//         sx={{
//           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//           color: "white",
//           py: { xs: 4, md: 6 },
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         <Container maxWidth="lg">
//           <Box textAlign="center" mb={4}>
//             <Typography
//               variant={isMobile ? "h4" : "h2"}
//               fontWeight="bold"
//               mb={2}
//               sx={{
//                 fontFamily: "titillium",
//                 fontSize: { xs: "2rem", md: "3.5rem" },
//               }}
//             >
//               Welcome to Kaps
//             </Typography>
//           </Box>

//           {/* Enhanced Booking Form */}
//           <Box
//             sx={{
//               maxWidth: 600,
//               mx: "auto",
//               backgroundColor: "white",
//               borderRadius: 3,
//               p: { xs: 3, md: 4 },
//               boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
//             }}
//           >
//             <Typography
//               variant="h5"
//               fontWeight="bold"
//               mb={3}
//               color="#333"
//               textAlign="center"
//               sx={{ fontFamily: "titillium" }}
//             >
//               Get Your Ride Estimation
//             </Typography>

//             {/* City Selector */}
//             <Box sx={{ mb: 2 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Select City</InputLabel>
//                 <Select
//                   value={selectedCityId || ""}
//                   onChange={(e) => {
//                     const selected = cities.find(city => city.city_id === e.target.value);
//                     if (selected) {
//                       setSelectedCity(selected.city_name);
//                       setSelectedCityId(selected.city_id);
//                       setSelectedCityCoveredDistance(selected.covered_distance);
//                     }
//                   }}
//                   sx={{
//                     borderRadius: 2,
//                     backgroundColor: "#f8f9fa",
//                   }}
//                 >
//                   {cities.map((city) => (
//                     <MenuItem key={city.city_id} value={city.city_id}>
//                       {city.city_name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>

//             <Formik
//               initialValues={initialValues}
//               validationSchema={validationSchema}
//               onSubmit={handleFormSubmit}
//             >
//               {({ values, errors, touched, handleBlur, handleSubmit, setFieldValue }) => (
//                 <form onSubmit={handleSubmit}>
//                   <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                     {/* Pickup Location with Autocomplete */}
//                     <Box sx={{ position: "relative" }}>
//                       <TextField
//                         fullWidth
//                         ref={pickupInputRef}
//                         placeholder="Enter Pickup Location"
//                         value={pickupLocation}
//                         onChange={(e) => {
//                           setPickupLocation(e.target.value);
//                           setFieldValue("pickupLocation", e.target.value);
//                         }}
//                         onBlur={handleBlur}
//                         error={Boolean(errors.pickupLocation && touched.pickupLocation)}
//                         helperText={touched.pickupLocation && errors.pickupLocation}
//                         InputProps={{
//                           startAdornment: (
//                             <InputAdornment position="start">
//                               <LocationOn sx={{ color: "#4CAF50" }} />
//                             </InputAdornment>
//                           ),
//                         }}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             borderRadius: 2,
//                             backgroundColor: "#f8f9fa",
//                             "& fieldset": {
//                               borderColor: "#e0e0e0",
//                             },
//                             "&:hover fieldset": {
//                               borderColor: "#4CAF50",
//                             },
//                             "&.Mui-focused fieldset": {
//                               borderColor: "#4CAF50",
//                             },
//                           },
//                         }}
//                       />

//                       {/* Pickup Suggestions */}
//                       {pickupSuggestions.length > 0 && (
//                         <Paper
//                           elevation={3}
//                           sx={{
//                             position: "absolute",
//                             top: "100%",
//                             left: 0,
//                             right: 0,
//                             zIndex: 10,
//                             maxHeight: 200,
//                             overflowY: "auto",
//                           }}
//                         >
//                           <List>
//                             {pickupSuggestions.map((suggestion) => (
//                               <ListItem
//                                 key={suggestion.place_id}
//                                 button
//                                 onClick={() => {
//                                   handlePickupSuggestionClick(suggestion);
//                                   setFieldValue("pickupLocation", suggestion.description);
//                                 }}
//                                 sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
//                               >
//                                 <ListItemText
//                                   primary={suggestion.description}
//                                   sx={{ fontSize: "0.875rem" }}
//                                 />
//                               </ListItem>
//                             ))}
//                           </List>
//                         </Paper>
//                       )}
//                     </Box>

//                     {/* Drop Location with Autocomplete */}
//                     <Box sx={{ position: "relative" }}>
//                       <TextField
//                         fullWidth
//                         ref={dropInputRef}
//                         placeholder="Enter Drop Location"
//                         value={dropLocation}
//                         onChange={(e) => {
//                           setDropLocation(e.target.value);
//                           setFieldValue("dropLocation", e.target.value);
//                         }}
//                         onBlur={handleBlur}
//                         error={Boolean(errors.dropLocation && touched.dropLocation)}
//                         helperText={touched.dropLocation && errors.dropLocation}
//                         InputProps={{
//                           startAdornment: (
//                             <InputAdornment position="start">
//                               <FlagOutlined sx={{ color: "#f44336" }} />
//                             </InputAdornment>
//                           ),
//                         }}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             borderRadius: 2,
//                             backgroundColor: "#f8f9fa",
//                             "& fieldset": {
//                               borderColor: "#e0e0e0",
//                             },
//                             "&:hover fieldset": {
//                               borderColor: "#f44336",
//                             },
//                             "&.Mui-focused fieldset": {
//                               borderColor: "#f44336",
//                             },
//                           },
//                         }}
//                       />

//                       {/* Drop Suggestions */}
//                       {dropSuggestions.length > 0 && (
//                         <Paper
//                           elevation={3}
//                           sx={{
//                             position: "absolute",
//                             top: "100%",
//                             left: 0,
//                             right: 0,
//                             zIndex: 10,
//                             maxHeight: 200,
//                             overflowY: "auto",
//                           }}
//                         >
//                           <List>
//                             {dropSuggestions.map((suggestion) => (
//                               <ListItem
//                                 key={suggestion.place_id}
//                                 button
//                                 onClick={() => {
//                                   handleDropSuggestionClick(suggestion);
//                                   setFieldValue("dropLocation", suggestion.description);
//                                 }}
//                                 sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
//                               >
//                                 <ListItemText
//                                   primary={suggestion.description}
//                                   sx={{ fontSize: "0.875rem" }}
//                                 />
//                               </ListItem>
//                             ))}
//                           </List>
//                         </Paper>
//                       )}
//                     </Box>

//                     {/* Contact Name */}
//                     <TextField
//                       fullWidth
//                       placeholder="Enter Your Full Name"
//                       value={contactName}
//                       onChange={(e) => {
//                         setContactName(e.target.value);
//                         setFieldValue("contactName", e.target.value);
//                       }}
//                       onBlur={handleBlur}
//                       error={Boolean(errors.contactName && touched.contactName)}
//                       helperText={touched.contactName && errors.contactName}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <Person sx={{ color: "#9c27b0" }} />
//                           </InputAdornment>
//                         ),
//                       }}
//                       sx={{
//                         "& .MuiOutlinedInput-root": {
//                           borderRadius: 2,
//                           backgroundColor: "#f8f9fa",
//                         },
//                       }}
//                     />

//                     {/* Contact Number */}
//                     <TextField
//                       fullWidth
//                       placeholder="Enter Your Phone Number"
//                       value={contactNumber}
//                       onChange={(e) => {
//                         setContactNumber(e.target.value);
//                         setFieldValue("contactNumber", e.target.value);
//                       }}
//                       onBlur={handleBlur}
//                       error={Boolean(errors.contactNumber && touched.contactNumber)}
//                       helperText={touched.contactNumber && errors.contactNumber}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <Phone sx={{ color: "#ff9800" }} />
//                           </InputAdornment>
//                         ),
//                       }}
//                       sx={{
//                         "& .MuiOutlinedInput-root": {
//                           borderRadius: 2,
//                           backgroundColor: "#f8f9fa",
//                         },
//                       }}
//                     />

//                     {/* Purpose Selection */}
//                     <FormControl
//                       fullWidth
//                       error={Boolean(errors.purpose && touched.purpose)}
//                     >
//                       <InputLabel>Purpose</InputLabel>
//                       <Select
//                         value={purpose}
//                         onChange={(e) => {
//                           setPurpose(e.target.value);
//                           setFieldValue("purpose", e.target.value);
//                         }}
//                         onBlur={handleBlur}
//                         sx={{
//                           borderRadius: 2,
//                           backgroundColor: "#f8f9fa",
//                         }}
//                       >
//                         <MenuItem value="personal">Personal</MenuItem>
//                         <MenuItem value="business">Business</MenuItem>
//                       </Select>
//                       {touched.purpose && errors.purpose && (
//                         <FormHelperText>{errors.purpose}</FormHelperText>
//                       )}
//                     </FormControl>

//                     {/* Submit Button */}
//                     <LoadingButton
//                       type="submit"
//                       variant="contained"
//                       size="large"
//                       fullWidth
//                       loading={formLoading}
//                       sx={{
//                         backgroundColor: "#FFC107",
//                         color: "#000",
//                         py: { xs: 1.5, md: 2 },
//                         fontSize: { xs: "1rem", md: "1.1rem" },
//                         fontWeight: "bold",
//                         borderRadius: 2,
//                         mt: 2,
//                         "&:hover": {
//                           backgroundColor: "#FFB300",
//                           transform: "translateY(-1px)",
//                         },
//                         transition: "all 0.3s ease",
//                       }}
//                     >
//                       Get Estimation
//                     </LoadingButton>
//                   </Box>
//                 </form>
//               )}
//             </Formik>
//           </Box>
//         </Container>
//       </Box>

//       {/* Services Section */}
//       <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
//         <Box textAlign="center" mb={4}>
//           <Typography
//             variant={isMobile ? "h4" : "h3"}
//             fontWeight="bold"
//             color="#333"
//             sx={{
//               fontFamily: "titillium",
//               fontSize: { xs: "1.8rem", md: "2.5rem" },
//               position: "relative",
//               "&::after": {
//                 content: '""',
//                 position: "absolute",
//                 bottom: -8,
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 width: 60,
//                 height: 4,
//                 backgroundColor: "#FFC107",
//                 borderRadius: 2,
//               },
//             }}
//           >
//             Our Services
//           </Typography>
//         </Box>

//         {loading ? (
//           <Grid container spacing={isMobile ? 2 : 3}>
//             {[...Array(6)].map((_, index) => (
//               <Grid item xs={4} md={2} key={index}>
//                 <LoadingSkeleton />
//               </Grid>
//             ))}
//           </Grid>
//         ) : error ? (
//           <Box textAlign="center" py={4}>
//             <Typography color="error" variant="h6">
//               {error}
//             </Typography>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={fetchAllServices}
//               sx={{ mt: 2 }}
//             >
//               Retry
//             </Button>
//           </Box>
//         ) : (
//           <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
//             {services.map((service, index) => (
//               <Grid
//                 item
//                 xs={3}
//                 sm={2}
//                 md={2}
//                 key={service.category_id || index}
//                 sx={{
//                   display: "flex",
//                   justifyContent: "center",
//                 }}
//               >
//                 <ServiceCard service={service} />
//               </Grid>
//             ))}
//           </Grid>
//         )}

//         {!loading && services.length === 0 && !error && (
//           <Box textAlign="center" py={4}>
//             <Typography variant="h6" color="textSecondary">
//               No services available at the moment
//             </Typography>
//           </Box>
//         )}
//       </Container>
//     </Box>
//   );
// };

// export default NewHeroBanner;
