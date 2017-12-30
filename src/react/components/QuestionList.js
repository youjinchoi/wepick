import React, { Component } from 'react';
import update from "react-addons-update";
import $ from "jquery";
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
                    no question yet T.T
                </div>
            );
        }

        return (
            <div id="mainContainer">
                <div id="wrewardmainWrap" className="wsubmain-wrap">
            <div className="wsubmain-content" style={{paddingTop: "15px"}}>
                <div id="wrewardProjectContent">
                    <div className="wsubmain-projectlist">
                        <ul id="progressCardList">
                            {this.state.questions.map((question, index) => {
                                return (
                                    <li key={index}>
                                        <div className="project-card">
                                            <div className="card-img-section">
                                                <span style={{position: "absolute", left: "0", padding: "10px", zIndex: "1", color: "#90949c", fontSize: "80%"}}><Timestamp timestamp={question.createDate}/></span>
                                                <a onClick={e => this.deleteQuestion(e, question.seq, index)} href="#" style={{position: "absolute", right: "0", padding: "10px", zIndex: "1", color: "#90949c", fontSize: "80%"}}>
                                                    삭제
                                                </a>
                                                <div className="project-img" style={{backgroundColor: "#fff", height: "250px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", top: "50%"}}>
                                                    {question.contents}
                                                </div>
                                                <div className="progressbar-wrap">
                                                    <dl>
                                                        <dt><span style={{"width":(question.answerCount/question.maxAnswerCount*100)+"%"}}></span></dt>
                                                        <dd>
                                                            <span className="percent">{question.answerCount/question.maxAnswerCount*100}%</span>
                                                            <span className="days">{question.answerCount}/{question.maxAnswerCount}</span>
                                                        </dd>
                                                    </dl>
                                                </div>
                                            </div>
                                            <div className="card-info-section">
                                                {question.options.map((option, index) => {
                                                    return (
                                                        <div key={index} style={{height: "40px", display: "flex", alignItems: "center"}}>
                                                            <div style={{paddingLeft: "20px", alignItems: "center", color: "#fff", fontSize: "90%", fontWeight: "100"}}>{option.value}</div>
                                                            <div style={{position: "absolute", right: "20px", textAlign: "right", color: "#1fdc6d", fontSize: "90%"}}>{option.count}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
                    </div></div>
        );
    }

    componentDidMount() {
        if (!window.__admin_loggedIn) {
            this.props.history.push("/login");
            return;
        }
        this.getDocuments();
        $(window).on("scroll", $.proxy(this.loadMoreIfScrollEnd, this));
    }

    componentWillUnmount() {
        $(window).off("scroll", $.proxy(this.loadMoreIfScrollEnd, this));
    }

    getDocuments = () => {
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
            this.getDocuments(this.state.next);
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