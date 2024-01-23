const isScrollbarAtBottom = (e) => {
    return (
        e.target.scrollHeight ===
        Math.ceil(e.target.scrollTop + e.target.getBoundingClientRect().height)
    );
};

export default isScrollbarAtBottom;
