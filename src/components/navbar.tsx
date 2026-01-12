import { Navbar, NavLink, NavbarCollapse, NavbarText, NavbarBrand } from "react-bootstrap";

interface NavbarProps {
    username: string;
    onLogOut: () => void;
}

export default function NavbarComponent({
    username,
    onLogOut,
}: NavbarProps) {
  return (
    <Navbar>
        <NavbarBrand>
            Welcome <span>{username}</span>
        </NavbarBrand>
        <NavLink>
            Accounts
        </NavLink>
        <NavbarCollapse>
          <NavbarText>
            <NavLink onClick={onLogOut}>Sign out</NavLink>
          </NavbarText>
        </NavbarCollapse>
    </Navbar>
  );
}