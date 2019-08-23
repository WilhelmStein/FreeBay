import React, { Component } from 'react';
import {Fade, Button} from '@material-ui/core';
import autoBind from 'auto-bind';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import '../style/Carousel.scss';

export default class Carousel extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            active: 0
        }

        this.timer = null;
        this.interval = this.props.interval ? this.props.interval : 4000;
        this.autoPlay = this.props.autoPlay ? this.props.autoPlay : true;

        autoBind(this);
    }

    componentDidMount()
    {
        if (this.autoPlay)
        {
            this.timer = setInterval(this.next, this.interval);
        }
    }

    resetAutoPlay()
    {
        if (this.autoPlay)
        {
            clearInterval(this.timer);
            this.timer = setInterval(this.next, this.interval);
        }
    }

    next(event)
    {
        const next = this.state.active + 1 > this.props.children.length - 1 ? 0 : this.state.active + 1;

        this.setState({
            active: next
        }, this.resetAutoPlay)

        if (event)
            event.stopPropagation();
    }

    prev(event)
    {
        const prev = this.state.active - 1 < 0 ? this.props.children.length - 1 : this.state.active - 1;

        this.setState({
            active: prev
        }, this.resetAutoPlay)

        if (event)
            event.stopPropagation();
    }

    render()
    {
        return (
            <div className="Carousel">
                {
                    this.props.children.map( (child, index) => {
                        return (
                            <CarouselItem key={index} active={index === this.state.active ? true : false} child={child}/>
                        )
                    })
                }
                <Button className="Next Button" onClick={this.next}>
                    &rarr;
                </Button>
                <Button className="Previous Button" onClick={this.prev}>
                    &larr;
                </Button>

                <Indicators length={this.props.children.length} active={this.state.active}/>
            </div>
        )
    }
}

function CarouselItem(props)
{
    return (
        props.active ? 
        (
            <div className="CarouselItem">
                <Fade in={props.active} timeout={500}>
                    {props.child}
                </Fade>
            </div>
        ) : null
    )
}

function Indicators(props)
{
    let indicators = [];
    for (let i = 0; i < props.length; i++)
    {
        const className = i === props.active ? "Active Indicator" : "Indicator";
        const item = <FiberManualRecordIcon key={i} size='small' className={className}/>;

        indicators.push(item);
    }

    return (
        <div className="Indicators">
            {indicators}
        </div>
    )
}