import React, { Component } from 'react';
import $ from "jquery";
import {withRouter} from "react-router-dom";

class QuestionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: window.__user_loggedIn ? {email: window.__user_email, accessKey: window.__user_accessKey} : null,
            contents: "",
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            maxAnswerCount: 100
        };
    }

    render() {
        if (!window.__admin_loggedIn) {
            return null;
        }
        
        if (!this.state.user) {
        	return (
    			<div id="accountWrap">
                    <div id="newContainer">
                        <div className="account-wrap">
                            <div className="email-input-wrap bigger">
                            	<h3>질문을 등록하려면 사용자 로그인이 필요합니다.</h3><br/>
                                <form onSubmit={this.login} name="frm_login" id="frm_login">
                                    <input ref={el => this.email = el} type="email" id="userName" name="userName" className="input-text" placeholder="이메일"/>
                                    <input ref={el => this.password = el} type="password" className="input-text" placeholder="비밀번호"/>
                                    <div className="btn-wrap">
                                        <input onClick={this.login} type="submit" className="btn-block-mint" value="확인"/>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
        	);
        }

        return (
            <div id="accountWrap">
	            <div id="newContainer">
		            <div className="account-wrap" style={{padding:"10px 20px"}}>
		            	<div>
        				<div style={{height:"35px",display:"flex", alignItems:"center", float:"left",margin:"10px 0"}}>{this.state.user.email}</div>
        				<button style={{margin:"10px 0",width:"80px",height:"35px", lineHeight:"35px", float:"right",background:"#90949c", padding: "0"}} onClick={this.logout} type="button" id="btnLogin" className="btn-block-mint">로그아웃</button>
		                </div>
        				<div className="">
		                    <form onSubmit={this.postQuestion} name="frm_login" id="frm_login">
		                    	<textarea ref={el => this.contents = el} onChange={this.handleChange} value={this.state.contents} name="contents" className="question-form-contents text-area" placeholder="질문 내용을 입력하세요"></textarea><br/>
		                    	<input ref={el => this.option1 = el} onChange={this.handleChange} value={this.state.option1} name="option1" type="text" className="input-text" placeholder="첫번째 선택지를 입력하세요(필수)"/>
		                    	<input ref={el => this.option2 = el} onChange={this.handleChange} value={this.state.option2} name="option2" type="text" className="input-text" placeholder="두번째 선택지를 입력하세요(필수)"/>
	                    		<input ref={el => this.option3 = el} onChange={this.handleChange} value={this.state.option3} name="option3" type="text" className="input-text" placeholder="세번째 선택지를 입력하세요"/>
		                        <input ref={el => this.option4 = el} onChange={this.handleChange} value={this.state.option4} name="option4" type="text" className="input-text" placeholder="네번째 선택지를 입력하세요"/>
	                        	<div style={{width:"100%"}}>
			                    	답변 받을 개수를 선택하세요.
				                    <select ref={el => this.maxAnswerCount = el} onChange={this.handleChange} value={this.state.maxAnswerCount} name="maxAnswerCount" className="question-form-select">
				                        <option value={5}>5개</option>
				                        <option value={10}>10개</option>
				                        <option value={50}>50개</option>
				                        <option value={100}>100개</option>
				                    </select>
				                </div>
		                        <div className="btn-wrap">
		                            <button onClick={this.postQuestion} type="button" id="btnLogin" className="btn-block-mint">확인</button>
		                        </div>
		                    </form>
		                </div>
		            </div>
		        </div>
            </div>
        );
    }

    componentDidMount() {
        if (!window.__admin_loggedIn) {
            this.props.history.push("/login");
        }
    }
    
    handleChange = (e) => {
    	this.setState({[e.target.name]: e.target.value});
    }
    
    clear() {
    	this.setState({
    		contents: "",
    		option1: "",
    		option2: "",
    		option3: "",
    		option4: "",
    		maxAnswerCount: 100
    	});
    }

    login = (e) => {
        e.preventDefault();
        if (!this.email.value) {
            alert('이메일을 입력해주세요.');
            return;
        }
        if (!this.password.value) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        $.ajax({
            url: "/admin/user-login",
            type: "post",
            data: JSON.stringify({
                email: this.email.value,
                password: this.password.value
            }),
            contentType: "application/json",
            dataType: "json",
            success: function(res) {
            	if (res && res.status == "OK") {
                    window.__user_email = this.email.value;
                    window.__user_accessKey = res.result.accessKey;
                    this.setState({
                        user: {
                        	email: this.email.value,
                        	accessKey: res.result.accessKey
                        }
                    });
                }
            }.bind(this),
            error: function(res) {
            	const errorCode = res.responseJSON.result.code;
            	if (errorCode == 1003) {
            		alert('비밀번호가 올바르지 않습니다.');
            	} else if (errorCode == 1005) {
            		alert('이메일이 존재하지 않습니다.');
            	} else {
            		alert('요청 중 오류가 발생하였습니다.');
            	}
            }.bind(this),
            timeout: 2000
        });
    }
	                        	
    logout = (e) => {
        e.preventDefault();
        $.ajax({
            url: "/admin/user-logout",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            success: function(res) {
                if (res && res.status == "OK") {
                	window.__user_loggedIn = false;
                	window.__user_email = null;
                    window.__user_accessKey = null;
                    this.setState({
                        user: null
                    });
                }
            }.bind(this),
            error: function(res, err) {
            }.bind(this),
            timeout: 2000
        });
    }

    postQuestion = (e) => {
        e.preventDefault();
        if (this.isBlank(this.state.contents)) {
            alert("질문을 입력해주세요.");
            return;
        }
        if (this.isBlank(this.state.option1) || this.isBlank(this.state.option2)) {
            alert("답변은 2개 이상 입력해주세요.");
            return;
        }
        var options = [this.state.option1, this.state.option2];
        if (!this.isBlank(this.state.option3)) {
            options.push(this.state.option3);
        }
        if (!this.isBlank(this.state.option4)) {
            options.push(this.state.option4);
        }
        $.ajax({
            url: "/questions",
            type: "post",
            dataType: "json",
            data: JSON.stringify({
                contents: this.state.contents,
                options: options,
                maxAnswerCount: this.state.maxAnswerCount || 5
            }),
            contentType: "application/json",
            beforeSend : function(xhr){
                xhr.setRequestHeader("Access-Key", this.state.user.accessKey);
            }.bind(this),
            success: function(res) {
                if (res && res.status == "OK") {
                	alert('질문이 등록되었습니다.');
                	this.clear();
                }
            }.bind(this),
            error: function(res, err) {
                alert('요청중 오류가 발생하였습니다.');
            }.bind(this),
            timeout: 5000
        });
    }
    
    isBlank(str) {
    	return !str || str.trim() == "";
    }
}

export default withRouter(QuestionForm);