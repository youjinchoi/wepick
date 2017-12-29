import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
	return (
		<div>
			<header className="site-header">
				<div className="wrapper">
					<nav className="site-nav">
						<div className="trigger">
							<Link to="/questions">질문 관리</Link>
							<Link to="/questions/form">질문 등록</Link>
						</div>
					</nav>
				</div>
			</header>
		</div>
    );
  }
}

export default Header;