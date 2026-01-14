import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

interface NavbarProps {
  username: string;
  onLogOut: () => void;
}

export default function NavbarComponent({ username, onLogOut }: NavbarProps) {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Vencura</Navbar.Brand>
        <span className="navbar-text">Welcome {username}</span>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <span className="navbar-text mx-2">|</span>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/accounts">Accounts</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link onClick={onLogOut}>Sign out</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
