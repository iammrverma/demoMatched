document.addEventListener("DOMContentLoaded", ()=>{
    const customStyles = {
        backgroundColor: '#e9a7a9',
        color: '#fff',          
        borderRadius: '5px',     
        padding: '.25rem .55rem',          
        // boxShadow: '0px 0px 2px 2px rgba(0, 0, 0, 0.2)',
        fontSize: '12px',
    };
    
    const applyCustomStyles = (instance) => {
        const box = instance.popper.querySelector('.tippy-box');
        Object.assign(box.style, customStyles);
    };
    tippy.setDefaultProps({
        delay: [500, 0],
        onMount(instance) {
            applyCustomStyles(instance);
        }

    });
    tippy('#gear', {
        content: 'User Access',
        placement: 'left',
    });
    tippy('#user', {
        content: 'Change password',
        placement: 'top'
    });
});