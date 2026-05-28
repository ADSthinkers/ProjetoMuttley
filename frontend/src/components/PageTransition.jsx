import { motion } from "framer-motion";

export const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
        filter: "blur(4px)"
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: "blur(4px)",
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export const containerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export const cardHover = {
    whileHover: { 
        scale: 1.01,
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    whileTap: { scale: 0.99 }
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
