import React, { Component } from 'react';
import $ from "jquery";
import {withRouter} from "react-router-dom";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documents: null
        };
    }

    render() {
        return (
            <div id="accountWrap">
                <div id="newContainer">
                    <div className="account-wrap">
                        <div className="email-input-wrap bigger">
                            <form onSubmit={this.submit} name="frm_login" id="frm_login">
                                <input ref={el => this.passCode = el} type="password" id="userName" name="userName" className="input-text" placeholder="passcode를 입력해 주세요."/>
                                <div className="btn-wrap">
                                    <button onClick={this.submit} type="button" id="btnLogin" className="btn-block-mint">확인</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    submit = (e) => {
        e.preventDefault();
        if (!this.passCode.value) {
            alert("Admin 비밀번호를 입력해주세요.");
            return;
        }
        $.ajax({
            url: "/admin/login",
            type: "post",
            dataType: "json",
            beforeSend : function(xhr){
                xhr.setRequestHeader("Server-Key", this.passCode.value);
            }.bind(this),
            success: function(res) {
                if (res && res.status == "OK") {
                    window.__admin_loggedIn = true;
                    window.__admin_passCode = this.passCode.value;
                    this.props.history.push("/questions");
                }
            }.bind(this),
            error: function(res, err) {
                alert('요청중 오류가 발생하였습니다.');
            }.bind(this),
            timeout: 2000
        });
    }
}

export default withRouter(Login);