import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Grid, CardMedia, CardContent, Typography, Box} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating'
import Carousel from './Carousel';
import '../style/Home.scss';
import Axios from 'axios';
import autoBind  from 'auto-bind';

class Home extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            user: this.props.user,
            recommended: [],
            history: props.history
        };

        autoBind(this);
    }

    componentDidMount()
    {
        Axios.post('/api/recommended', {username: (this.state.user == null) ? (null) : (this.state.user.Username)})
        .then( res => {
            this.setState({recommended: res.data.data});
        });
    }

    render()
    {
        return (
            <div className="Home">
                <Carousel user={this.state.user} loginHandler={this.props.loginHandler}/>

                <div style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                    <h2>Recommended for you</h2>
                    <hr/>
                    <Grid container
                        direction = "row"
                        justify = "flex-start"
                        alignItems = "center"
                        spacing={2}
                        className="RecommendedGrid"
                    >
                        {this.state.recommended.map( (item) => {
                            return <RecommendedItem key={item.Id} item={item} history={this.state.history}/>
                        })}
                    </Grid>
                </div>
            </div>
        );
    }
}

class RecommendedItem extends Component
{

    constructor(props)
    {
        super(props);
        autoBind(this);
        this.state = {
            item: props.item
        }
    }

    onClick(e)
    {
        this.props.history.push(`/auction/${this.state.item.Id}`);
    }

    render()
    {
        const rating = Math.round((this.state.item.User.Seller_Rating * 5.0) / 100.0 * 2) / 2;
        return <Grid key={this.state.item.Id} item xs={2} className = "Wrapper">
                    <Card className="Item" onClick={this.onClick}>
                        <CardMedia className="Media"
                            image={`/api/image?path=${this.state.item.Images[0].Path}`}
                            title={this.state.item.Name}
                            
                        />

                        <CardContent className="ItemBody">
                            <Typography variant="h4" noWrap>
                                {this.state.item.Name}
                            </Typography>

                            <Box>
                                <Typography display="inline"> Sold By:</Typography>

                                <Typography className="Seller" display="inline" variant="h5">
                                    &nbsp; &nbsp;{this.state.item.User.Username}
                                </Typography>
                                    
                                <Rating display="inline" value={rating} precision={0.5} readOnly />
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
    }
}

export default withRouter(Home);