import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import React from "react";
import NextLink from "next/link";
import Rating from "@material-ui/lab/Rating";
import { productItem as string } from "../utils/string";
export default function ProductItem({ product, addToCartHandler }) {
  return (
    <Card style={{ maxWidth: 400 }}>
      <NextLink href={`/product/${product.slug}`} passHref>
        <CardActionArea>
          <CardMedia
            component="img"
            image={product.image}
            title={product.name}
            height={400}
          ></CardMedia>
          <CardContent>
            <Typography>{product.name}</Typography>
            <Rating value={product.rating} readOnly></Rating>
          </CardContent>
        </CardActionArea>
      </NextLink>
      <CardActions>
        <Typography>
          {product.price}
          {string.prefixMony}
        </Typography>
        <Button
          size="small"
          color="primary"
          onClick={() => addToCartHandler(product)}
        >
          {string.addToCart}
        </Button>
      </CardActions>
    </Card>
  );
}
