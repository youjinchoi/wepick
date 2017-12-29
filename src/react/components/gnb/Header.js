import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
	return (
		<div id="wadizHeader">
			<div id="headerBar">
				<div className="left-section">
					<div id="MowGnb" className="device-gnb">
						<label className="btn-gnb-open">
							<h1>
								<img src="/static/img/app_logo.png" with="48" height="48"/>
							</h1>
						</label>
					</div>
					<div id="FbwGnb" className="device-gnb">
						<div className="gnbsub-menu">
							<h1>
								<Link to="/">
									<img src="/static/img/app_logo.png" with="56" height="56"/>
								</Link>
							</h1>
							<div className="menu-list">
								<ul>
									<li><Link to="/questions">질문 관리</Link></li>
									<li><Link to="/questions/form">질문 등록</Link></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<div className="right-section">
					<ul className="util-menu">
						<li><Link to="/questions">질문 관리</Link></li>
						<li><Link to="/questions/form">질문 등록</Link></li>
					</ul>
				</div>
			</div>
		</div>
    );
  }
}

export default Header;