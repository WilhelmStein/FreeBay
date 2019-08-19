import React, { Component } from 'react';
import { Carousel, CarouselSlide } from 'material-ui-carousel';
import { Card, CardContent, CardMedia, Typography, Box, Grid, Button } from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
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
            console.log(res.data.data)
            
            this.setState({
                auctions: res.data.data
            });
        });

    }

    render() {

        return (
            <div style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                <h2>Featured Auctions</h2>
                <hr/>
                <Carousel>
                    {this.state.auctions.map((item) => {
                        return  <CarouselSlide key={item.Id}>
                                    <div className = "FeaturedItemWrapper Square">
                                        <FeaturedItem item={item}/>
                                    </div>
                                </CarouselSlide>
                    })}
                </Carousel>
            </div>
        )
    }
}

function FeaturedItem(props)
{
    const rating = Math.round((props.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Card className="Item">
            <CardMedia
                image={`/api/image?path=${props.item.Images[0].Path}`}
                title={props.item.Name}
            />
            <CardContent className="ItemBody">
                <Typography variant="h2">
                    {props.item.Name}
                </Typography>

                <Box mb={3}>
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
                        <Typography className="Current Price" variant="h4">EUR {props.item.Currently.toFixed(2)}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h5" className="Title">Buyout Price:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className="Buyout Price" variant="h4">EUR {props.item.Buy_Price.toFixed(2)}</Typography>
                    </Grid>
                </Grid>

                <Grid container className="Timer">
                    <Grid item xs={6}>
                        <Typography className="Title" variant="h4">Time Remaining:</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography className="Time_Remaining" variant="h3">{(new Date(props.item.Ends) - new Date(props.item.Started))/1000/60/60/24}</Typography>
                    </Grid>
                </Grid>

                <Box mt={3} className="Buttons">
                    <Button className="Bid Button" variant="contained">
                        Bid
                    </Button>
                    <Button className="Buyout Button" variant="contained">
                        Buyout
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}