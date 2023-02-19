import {motion} from "framer-motion";
import {Star, StarBorderOutlined} from "@mui/icons-material";
import React from "react";
import {toast} from "react-toastify";

export const FavouriteButton = ({isFavourite}: { isFavourite: boolean }) => {
    return isFavourite ? (
        <motion.div transition={{duration: 0.1}}>
            <Star className={'fill-accent'}/>
        </motion.div>
    ) : (
        <motion.div animate={{rotate: 72}} transition={{duration: 0.1}}>
            <StarBorderOutlined className={'fill-accent'}/>
        </motion.div>
    );
};