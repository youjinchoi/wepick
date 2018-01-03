import React, { Component } from 'react';
import Timestamp from "./common/Timestamp"

class Question extends Component {
    getTopAnswerCount(options) {
    	var topCount = 1;
    	options.map(option => {
    		if (option.count > topCount) {
    			topCount = option.count;
    		}
    	});
    	return topCount;
    }

    render() {
        var question = this.props.question;
    	var topAnswerCount = this.getTopAnswerCount(question.options);
    	return (
    		<div className="question-card">
                <div className="card-img-section">
                    <span className="create-date"><Timestamp timestamp={question.createDate}/></span>
                    <a onClick={e => this.props.deleteQuestion(e, question.seq, this.props.index)} className="btn-delete" href="#">삭제</a>
                    <div className="question-contents project-img">{question.contents}</div>
                    <div className="progressbar-wrap">
                        <dl>
                            <dt><span style={{"width":(question.answerCount/question.maxAnswerCount*100)+"%"}}></span></dt>
                            <dd>
                                <span className="percent">{Math.round(question.answerCount/question.maxAnswerCount*100)}%</span>
                                <span className="days">{question.answerCount}/{question.maxAnswerCount}</span>
                            </dd>
                        </dl>
                    </div>
                </div>
                <div className="card-info-section">
                    {question.options.map((option, index) => {
                        return (
                            <div className="question-option" key={index}>
                                <div className="value-wrap">
                                    <div className="value">
                                        <span className="u_txt">{option.value}</span>
                                    </div>
                                </div>
                                <div className="count">
                                    <span className={(topAnswerCount == option.count ? " top" : "")}>{option.count}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default Question;