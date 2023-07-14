import { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import { NavLink } from 'react-router-dom';
//contexts
import { NavContext } from '../contexts/NavContext';

export function Navigation(props) {
  const NavigationItems = useContext(NavContext);
  console.log(NavigationItems);
  const Items = NavigationItems.map((item, index) => {
    return (
      <Nav.Item key={index}>
        <Nav.Link as={NavLink} to={item.goto}>
          {item.name}
        </Nav.Link>
      </Nav.Item>
    );
  });
  return <Nav>{Items}</Nav>;
}