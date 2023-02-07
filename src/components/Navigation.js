import Navbar from 'react-bootstrap/Navbar'

import { ReactComponent as Logo } from '../logo.svg'

const Navigation = ({ account }) => {
  return (
    <Navbar className="my-3">
      <Logo alt="logo" className="d-inline-block align-top mx-3" />
      <Navbar.Brand href="#">Punkers</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>{account}</Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
