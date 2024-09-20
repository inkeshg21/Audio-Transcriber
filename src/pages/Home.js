
import React from 'react';
import Recorder from '../components/Recorder';
import { Container, Row, Col } from 'react-bootstrap';

const Home = () => {
    return (
        <Container className="text-center mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="mb-4">Language Recorder and Translator</h1>
                    <Recorder />
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
