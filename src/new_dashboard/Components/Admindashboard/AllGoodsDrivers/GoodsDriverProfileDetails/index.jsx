import GLightbox from "glightbox";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { serverEndPoint } from "../../../../../dashboard/app/constants";
import Loader from "../../../Loader";

import GoodsDriverDocumentsDetails from "../GoodsDriverDocumentsDetails";
import GoodsDriverAboutMeCard from "../GoodsDriverAboutMeCard";
import GoodsDriverEditModal from "../GoodsDriverEditProfileDetailsModel";

const GoodsDriverProfileDetails = () => {
  const { agent_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    GLightbox({
      selector: ".glightbox",
      touchNavigation: true,
      loop: true,
      closeButton: true,
    });
  }, []);

  const fetchAgentDetails = async () => {
    const token = Cookies.get("authToken");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${serverEndPoint}/get_goods_driver_details`,
        {
          goods_driver_id: agent_id,
        },
        config
      );

      const data = response.data.result || [];
      setDriverData(data);
      console.log("Driver Data:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDetails();
  }, [agent_id, refreshTrigger]);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
  };

  if (loading) {
    return <Loader />;
  }

  if (!driverData) {
    return (
      <Container fluid className="m-5">
        <div className="text-center">
          <h4>Driver not found</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="m-5">
      <Row className="m-1">
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="main-title">Driver Profile</h4>
              <ul className="app-line-breadcrumbs mb-3">
                <li className="">
                  <a href="#" className="f-s-14 f-w-500">
                    <span>
                      <i className="ph-duotone ph-stack f-s-16"></i> Goods
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" className="f-s-14 f-w-500">
                    Agent ID #{agent_id}
                  </a>
                </li>
                <li className="active">
                  <a href="#" className="f-s-14 f-w-500">
                    Profile
                  </a>
                </li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsEditModalOpen(true)}
            >
              <i className="ti ti-edit me-2"></i>
              Edit Driver Details
            </button>
          </div>
        </Col>
      </Row>

      <Row className="m-5">
        <Col lg={8} md={6} sm={12}>
          <GoodsDriverDocumentsDetails
            driverData={driverData}
            onImageUpdate={handleEditSuccess}
          />
        </Col>
        <Col lg={4} md={6} sm={12}>
          <GoodsDriverAboutMeCard
            driverData={driverData}
            onStatusUpdate={handleEditSuccess}
          />
        </Col>
      </Row>

      {/* Edit Modal */}
      <GoodsDriverEditModal
        isOpen={isEditModalOpen}
        toggle={() => setIsEditModalOpen(!isEditModalOpen)}
        driverData={driverData}
        onSuccess={handleEditSuccess}
      />
    </Container>
  );
};

export default GoodsDriverProfileDetails; 