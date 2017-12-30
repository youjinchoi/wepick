import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import $ from "jquery";
import {withRouter} from "react-router-dom";


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
						{window.__admin_loggedIn ? 
								<li className="point"><a onClick={this.logout} href="#">로그아웃</a></li> : null
						}
					</ul>
				</div>
			</div>
		</div>
    );
  }
  
  logout = (e) => {
      $.ajax({
          url: "/admin/admin-logout",
          type: "post",
          dataType: "json",
          success: function(res) {
              if (res && res.status == "OK") {
                  window.__admin_loggedIn = false;
                  this.props.history.push("/login");
              }
          }.bind(this),
          error: function(res, err) {
              alert('요청중 오류가 발생하였습니다.');
          }.bind(this),
          timeout: 2000
      });
  }
}

export default withRouter(Header);