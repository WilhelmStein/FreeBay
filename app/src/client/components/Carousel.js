import React, { Component } from 'react';
import { Carousel, CarouselSlide } from 'material-ui-carousel';
import { Card, CardContent, CardMedia, Typography, Box, Grid, Button, ButtonGroup } from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import Countdown from 'react-countdown-now';

import axios from 'axios';
import '../style/Carousel.scss';


export default class CarouselWrapper extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            auctions: []
        };
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
                auctions: res.data.data
            });
        })
        .catch(err => {console.error(err);})
    }

    render() {

        return (
            <div style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                <h2>Featured Items</h2>
                {/* <hr/> */}
                <Carousel>
                    {
                        this.state.auctions.map((item, index) => {
                            return (
                                <CarouselSlide key={item.Id}>
                                    <div className = "FeaturedItemWrapper Square">
                                        <FeaturedItem item={item} index={index}/>
                                    </div>
                                </CarouselSlide>
                            )
                        })
                    }
                </Carousel>
            </div>
        )
    }
}

function FeaturedItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    let ends = props.item.Ends.split(' ');
    let date = ends[0].split('-')
    let time = ends[1].split(':');
    ends = {
        year: date[2],
        month: date[1],
        day: date[0],
        hour: time[0],
        minute: time[1]
    }

    let started = props.item.Started.split(' ')
    date = started[0].split('-')
    time = started[1].split(':');
    started = {
        year: date[2],
        month: date[1],
        day: date[0],
        hour: time[0],
        minute: time[1]
    }

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

    //console.log(difference);

    return (
        <Card className={`Item Item${(props.index % 2) + 1}`}>
            <CardMedia
                className="CardMedia"
                image={props.item.Images && props.item.Images.length ? `/api/image?path=${props.item.Images[0].Path}` : "https://dummyimage.com/250x250/ffffff/4a4a4a.png&text=No+Image"}
                title={props.item.Name}
            />
            <CardContent className="ItemBody">
                <Typography className="Title" variant="h2">
                    {props.item.Name}
                </Typography>

                <Box mb={3} className="SellerBox">
                    <Typography display="inline"> Sold By:</Typography>

                    <Typography className="Seller" display="inline" variant="h5">
                        &nbsp; &nbsp;{props.item.User.Username}
                    </Typography>
                        
                    <Rating display="inline" value={rating} precision={0.5} readOnly />
                </Box>
                
                <Grid container className="Prices" spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Starting Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Starting Price" variant="h4">EUR {props.item.First_Bid.toFixed(2)}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Current Price:</Typography>
                    </Grid>
                    <Grid item xs={6} zeroMinWidth>
                        <Typography className="Current Price" variant="h4">EUR {props.item.Currently ? props.item.Currently.toFixed(2) : "-"}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Buyout Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Buyout Price" variant="h4">EUR {props.item.Buy_Price ? props.item.Buy_Price.toFixed(2) : "-"}</Typography>
                    </Grid>
                </Grid>

                <Grid container className="Timer">
                    <Grid item xs={6}>
                        <Typography className="Title" variant="h4">Time Remaining:</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography className = "Time_Remaining" variant="h4">
                            <div>
                                {/* {`${difference.years} years, ${difference.months} months`} */}
                            </div>
                            <Countdown
                                date={new Date(props.item.Ends)}
                                renderer={ (props) =>
                                    <div>{props.days} Days: {props.hours} Hours: {props.minutes} Minutes: {props.seconds} Seconds</div>
                                }
                            />
                        </Typography>
                    </Grid>
                </Grid>

                <Box mt={3}>
                    <ButtonGroup className="Buttons">
                        <Button className="Bid Button" variant="contained">
                            Bid
                        </Button>
                        <Button className="Buyout Button" variant="contained">
                            Buyout
                        </Button>
                    </ButtonGroup>
                </Box>
            </CardContent>
        </Card>
    )
}