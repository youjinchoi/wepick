import React, { Component } from 'react';
import $ from "jquery";
import {withRouter} from "react-router-dom";

class QuestionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: window.__user ? window.__user : null,
            createdQuestion: null
        };
    }

    render() {
        if (!window.__admin_loggedIn) {
            return null;
        }

        return (
            <div className="wrapper home">
                {this.state.user ?
                    <div>{this.state.user.email} <input type="button" value="로그아웃"/></div>
                    :
                    <div>
                        <form onSubmit={this.login}>
                            <input ref={el => this.email = el} type="text" placeholder="email"/><br/>
                            <input ref={el => this.password = el} type="password" placeholder="password"/>
                            <input type="submit"/>
                        </form>
                    </div>
                }
                질문등록<br/>
                <form onSubmit={this.postQuestion}>
                    <textarea ref={el => this.contents = el} placeholder="Input Question"></textarea><br/>
                    <input ref={el => this.option1 = el} type="text" placeholder="Input Option"/><br/>
                    <input ref={el => this.option2 = el} type="text" placeholder="Input Option"/><br/>
                    <input ref={el => this.option3 = el} type="text" placeholder="Input Option(optional)"/><br/>
                    <input ref={el => this.option4 = el} type="text" placeholder="Input Option(optional)"/><br/>
                    <select ref={el => this.maxAnswerCount = el} defaultValue={100}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <input type="submit"/>
                </form>
            </div>
        );
    }

    componentDidMount() {
        if (!window.__admin_loggedIn) {
            this.props.history.push("/login");
        }
    }

    login = (e) => {
        e.preventDefault();
        if (!this.email.value) {
            alert('email을 입력해주세요.');
            return;
        }
        if (!this.password.value) {
            alert('password를 입력해주세요.');
            return;
        }
        $.ajax({
            url: "/login",
            type: "post",
            data: JSON.stringify({
                email: this.email.value,
                password: this.password.value
            }),
            contentType: "application/json",
            dataType: "json",
            success: function(res) {
                if (res && res.status == "OK") {
                    window.__user = {
                        email: this.email.value,
                        accessKey: res.result.accessKey
                    };
                    this.setState({
                        user: window.__user
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
        if (!this.contents.value) {
            alert("질문을 입력해주세요.");
            return;
        }
        if (!this.option1.value || !this.option2.value) {
            alert("답변은 2개 이상 입력해주세요.");
            return;
        }
        var options = [this.option1.value, this.option2.value];
        if (this.option3.value) {
            options.push(this.option3.value);
        }
        if (this.option4.value) {
            options.push(this.option4.value);
        }
        $.ajax({
            url: "/questions/",
            type: "post",
            dataType: "json",
            data: JSON.stringify({
                contents: this.contents.value,
                options: options,
                maxAnswerCount: this.maxAnswerCount.value || 5
            }),
            contentType: "application/json",
            beforeSend : function(xhr){
                xhr.setRequestHeader("Access-Key", this.state.user.accessKey);
            }.bind(this),
            success: function(res) {
                console.log(res);
                if (res && res.status == "OK") {
                    alert("질문이 등록되었습니다.");
                }
            }.bind(this),
            error: function(res, err) {
                alert('요청중 오류가 발생하였습니다.');
            }.bind(this),
            timeout: 2000
        });
    }
}

export default withRouter(QuestionForm);