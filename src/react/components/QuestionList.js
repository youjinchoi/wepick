import React, { Component } from 'react';
import update from "react-addons-update";
import $ from "jquery";
import Question from "./Question";
import Timestamp from "./common/Timestamp"
import {withRouter} from "react-router-dom";

class QuestionList extends Component {
    AJAX_LOCKED = false;

    constructor(props) {
        super(props);
        this.state = {
            questions: null,
            next: null,
            hasNext: true
        };
    }
    
    render() {
        if (!window.__admin_loggedIn) {
            return null;
        }

        if (!this.state.questions || this.state.questions.length == 0) {
            return (
                <div className="wrapper home">
                </div>
            );
        }

        return (
            <div id="mainContainer">
            	<div id="question-list-wrap" className="wsubmain-wrap">
		            <div className="wsubmain-content">
		                <div id="question-list-content">
		                    <div className="question-list">
		                        <ul>
		                            {this.state.questions.map((question, index) => {
		                                return (
		                                    <li key={index}>
		                                    	<Question question={question} index={index} deleteQuestion={this.deleteQuestion} />
		                                    </li>
		                                );
		                            })}
		                        </ul>
		                    </div>
		                </div>
		            </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        if (!window.__admin_loggedIn) {
            this.props.history.push("/login");
            return;
        }
        this.getQuestions();
        $(window).on("scroll", $.proxy(this.loadMoreIfScrollEnd, this));
    }

    componentWillUnmount() {
        $(window).off("scroll", $.proxy(this.loadMoreIfScrollEnd, this));
    }

    getQuestions = () => {
        if (!!this.AJAX_LOCKED) {
            return;
        }
        this.AJAX_LOCKED = true;
        var url = "/questions";
        if (!!this.state.next) {
            url += "?next=" + this.state.next;
        }
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            success: function(res) {
                if (!res.result.list || res.result.list.length == 0) {
                    this.setState({
                        next: null,
                        hasNext: false
                    });
                }
                this.setState({
                    questions: update(this.state.questions || [], {
                        $push: res.result.list
                    }),
                    next: res.result.next
                });
                this.AJAX_LOCKED = false;
            }.bind(this),
            error: function(res, err) {
                this.AJAX_LOCKED = false;
            }.bind(this),
            timeout: 5000
        });
    }

    loadMoreIfScrollEnd = () => {
        var scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        if (scrollTop + window.innerHeight - document.body.scrollHeight > -20){
            this.loadMore();
        }
    }

    loadMore() {
        if (!!this.state.hasNext) {
            this.getQuestions(this.state.next);
        }
    }

    deleteQuestion = (e, seq, index) => {
        e.preventDefault();
        if (confirm("질문을 삭제하시겠습니까?")) {
            $.ajax({
                url: "/admin/questions/" + seq,
                type: "delete",
                dataType: "json",
                success: function(res) {
                    if (res && res.status == "OK") {
                    	alert(res.result);
                        this.setState({
                            questions: update(this.state.questions, {
                                $splice: [[index, 1]]
                            })
                        });
                    }
                }.bind(this),
                error: function(res, err) {
                    alert('요청중 오류가 발생하였습니다.');
                }.bind(this),
                timeout: 5000
            });
        }
    }
}

export default withRouter(QuestionList);