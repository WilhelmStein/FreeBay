import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Carousel from './Carousel';
import { Card, CardContent, CardMedia, Typography, Grid, Button } from '@material-ui/core';

import autoBind from 'auto-bind';
import axios from 'axios';
import '../style/CarouselWrapper.scss';



class CarouselWrapper extends Component {

    constructor(props)
    {
        super(props);

        this.state = {
            categories: []
        };

        autoBind(this);
    }

    componentDidMount() {
        axios.get('/api/featured')
        .then( res => {
            if (res.data.error)
            {
                console.error(res.data.message);
                return;
            }

            this.setState({
                categories: res.data.data
            });
        })
        .catch(err => {console.error(err);})
    }

    pressImage(auction)
    {
        this.props.history.push(`/auction/${auction.Id}`);
    }

    pressView(category)
    {
        this.props.history.push(`search?category={${category}}&text={}`);
    }

    getProps(index)
    {
        let props ={};
        const mod = index % this.state.categories.length;

        if (mod === this.state.categories.length - 1)
        {
            props.contentPosition = "right";
        }
        else if (mod === 0 || mod === 3)
        {
            props.contentPosition = "left";
        }
        else if (mod === 1 || mod === 4) 
        {
            props.contentPosition = "middle";
        }
        else 
        {
            props.contentPosition = "right"
        }

        return props;
    }

    render() {

        return (
            <div style={{padding: "20px 100px", backgroundColor: "rgb(235, 235, 235)"}}>
                <Carousel>
                {
                    this.state.categories.map((category, index) => {
                        const props = this.getProps(index)

                        return (
                            <div key={category.Id} className="FeaturedItemWrapper Square">
                                <CategoryBanner 
                                    item={category}
                                    contentPosition={props.contentPosition}
                                    pressImage={this.pressImage}
                                    pressView={this.pressView}
                                />
                            </div>
                        )
                    })
                }
                </Carousel>
            </div>
        )
    }
}


function CategoryBanner(props)
{
    const contentPosition = props.contentPosition ? props.contentPosition : "left"
    const totalItems = props.length ? props.length : 3;
    const mediaLength = totalItems - 1;

    let items = [];
    const content = (
        <Grid item xs={12 / totalItems} key="content">
            <CardContent className="Content">
                <Typography className="Title">
                    {props.item.Name}
                </Typography>

                <Typography className="Caption">
                    Lorem ipsum dolor sit amet!
                </Typography>

                <Button variant="outlined" className="ViewButton" onClick={() => {props.pressView(props.item.Id)}}>
                    View Now
                </Button>
            </CardContent>
        </Grid>
    )

    
    for (let i = 0; i < mediaLength; i++)
    {
        const auction = props.item.Auctions[i];

        const media = (
            <Grid item xs={12 / totalItems} key={auction.Name}>
                <CardMedia
                    onClick={() => {props.pressImage(auction);}}
                    className="Media"
                    image={auction.Images && auction.Images.length ? `/api/image?path=${auction.Images[0].Path}` : 
                            "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                    title={auction.Name}
                    
                >
                    <Typography className="MediaCaption">
                        {auction.Name}
                    </Typography>
                </CardMedia>
            </Grid>
        )

        items.push(media);
    }

    if (contentPosition === "left")
    {
        items.unshift(content);
    }
    else if (contentPosition === "right")
    {
        items.push(content);
    }
    else if (contentPosition === "middle")
    {
        items.splice(items.length / 2, 0, content);
    }

    return (
        <Card raised className="CategoryBanner">
            <Grid container spacing={0} className="BannerGrid">
                {items}
            </Grid>
        </Card>
    )
}

function __getTime(string)
{
    let ret = string.split(' ');
    let date = ret[0].split('-')
    let time = ret[1].split(':');
    ret = {
        year: date[2],
        month: date[1],
        day: date[0],
        hour: time[0],
        minute: time[1]
    }

    return ret;
}

function __timeDifference(started, ends)
{
    let difference = {
        years: ends.year - started.year,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0
    }

    difference.months = ends.month - started.month;
    if (difference.months < 0)
    {
        difference.months += 12;
        difference.years -= 1;
    }
    difference.days = ends.day - started.day;
    if (difference.days < 0)
    {
        difference.days += 30;
        difference.months -= 1;
    }
    difference.days = ends.day - started.day;
    if (difference.days < 0)
    {
        difference.days += 30;
        difference.months -= 1;
    }
    difference.hours = ends.hour - started.hour;
    if (difference.hours < 0)
    {
        difference.hours += 24
        difference.days -= 1;
    }
    difference.minutes = ends.minute - started.minute;
    if (difference.hours < 0)
    {
        difference.minutes += 60
        difference.hours -= 1;
    }

    difference.string = difference.years === 0 ? "" : `${difference.years} years, `;
    difference.string += difference.months === 0 ? "" : `${difference.months} months, `;
    difference.string += difference.days === 0 ? "" : `${difference.days} days, `;
    difference.string += difference.hours === 0 ? "" : `${difference.hours} hours, `;
    difference.string += `${difference.minutes} minutes`;
    
    return difference;
}

export default withRouter(CarouselWrapper);