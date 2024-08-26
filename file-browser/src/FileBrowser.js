import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Breadcrumb,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { FaFolder, FaFileAlt } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_URL_URL_BACKEND;

const FileBrowser = () => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path) => {
    try {
      const response = await axios.get(`${BASE_URL}/files`, {
        params: { path },
      });
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFolderClick = (folderName) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  const handleBackClick = () => {
    const pathArray = currentPath.split("/");
    pathArray.pop();
    setCurrentPath(pathArray.join("/"));
  };

  const handleDownloadClick = (filename) => {
    window.location.href = `${BASE_URL}/files/download?filename=${
      currentPath ? currentPath + "/" + filename : filename
    }`;
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("path", currentPath);

    try {
      await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully!");
      fetchFiles(currentPath); // Refresh files after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => setCurrentPath("")}>
              Home
            </Breadcrumb.Item>
            {currentPath.split("/").map((segment, index) => (
              <Breadcrumb.Item
                key={index}
                onClick={() =>
                  setCurrentPath(
                    currentPath
                      .split("/")
                      .slice(0, index + 1)
                      .join("/")
                  )
                }
              >
                {segment}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Button variant="primary" onClick={handleFileUpload}>
              Upload
            </Button>
          </Form>
        </Col>
      </Row>
      {uploadSuccess && (
        <Row>
          <Col>
            <Alert
              variant="success"
              onClose={() => setUploadSuccess(false)}
              dismissible
            >
              File berhasil diupload.
            </Alert>
          </Col>
        </Row>
      )}
      {errorMessage && (
        <Row>
          <Col>
            <Alert
              variant="danger"
              onClose={() => setErrorMessage("")}
              dismissible
            >
              {errorMessage}
            </Alert>
          </Col>
        </Row>
      )}
      <Row>
        {currentPath && (
          <Col md={3} className="mb-4">
            <Card onClick={handleBackClick} style={{ cursor: "pointer" }}>
              <Card.Body className="text-center">
                <Card.Title>
                  <FaFolder size={50} /> ..
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        )}
        {files.map((file, index) => (
          <Col md={3} key={index} className="mb-4">
            <Card style={{ cursor: "pointer" }} className="text-center">
              <Card.Body
                onClick={() =>
                  file.isDirectory
                    ? handleFolderClick(file.name)
                    : handleDownloadClick(file.name)
                }
              >
                <Card.Title>
                  {file.isDirectory ? (
                    <FaFolder size={50} className="text-warning" />
                  ) : (
                    <FaFileAlt size={50} className="text-primary" />
                  )}
                </Card.Title>
                <Card.Text>{file.name}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FileBrowser;
