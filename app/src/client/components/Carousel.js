import React, { Component } from 'react'
import { Card, CardContent, CardMedia, Typography, Box, Grid, Button } from '@material-ui/core';
import {Rating} from '@material-ui/lab';
import { Carousel, CarouselSlide } from 'material-ui-carousel'
import axios from 'axios';

import '../style/Carousel.scss';


export default class CarouselWrapper extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            username: ( (this.props.user == null) ? (null) : (this.props.user.Username) ),
            auctions: []
        };
    }

    componentDidMount() {
        axios.post('/api/featured', {
            username: this.state.username
        })
        .then( res => {
            console.log(res.data.data)

            // Get actual photo here

            this.setState({
                auctions: res.data.data
            });
        });
    }

    render() {
        return (
            <div style={{ paddingLeft: '15%', paddingRight: '15%' }}>
                <h2>Featured Auctions</h2>
                <hr/>
                <Carousel>
                    {this.state.auctions.map(({ Id, Path, Name, Description, Seller_Id, Currently, Buy_Price }) => (
                        <CarouselSlide key={Id}>
                            <div className="FeaturedItemWrapper">
                                <Card className="Item">
                                    <CardMedia
                                        image={`/api/image/?path=${Path}`}
                                        title={Name}
                                        style={{
                                            height: 256,
                                            width: 256,
                                            resizeMode: 'contain',
                                        }}
                                    />
                                    <CardContent className="ItemBody">
                                        <Typography variant="h2">{Name}</Typography>

                                        <Box mb={3}>
                                            <Typography display="inline"> Sold By:</Typography>

                                            <Typography className="Seller" display="inline" variant="h5">
                                                &nbsp; &nbsp;{Seller_Id}
                                            </Typography>
                                                
                                            {/* <Rating display="inline" value={Rating} precision={0.5} readOnly /> */}
                                        </Box>
                                        
                                        <Typography paragraph className="Description">
                                            {Description === null ? "No Description." : Description}
                                        </Typography>
                                        
                                        <Grid container className="Prices" spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography variant="h5" className="Title">Current Price:</Typography>
                                            </Grid>
                                            <Grid item xs={6} zeroMinWidth>
                                                <Typography className="Current Price" variant="h4">EUR {Currently}</Typography>
                                            </Grid>

                                            <Grid item xs={6}>
                                                <Typography variant="h5" className="Title">Buyout Price:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography className="Buyout Price" variant="h4">EUR {Buy_Price}</Typography>
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
                            </div>
                        </CarouselSlide>
                    ))}
                </Carousel>
            </div>
        )
    }
}