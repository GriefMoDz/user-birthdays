const { React, getModule } = require('powercord/webpack')
const { icon } = getModule(['member', 'ownerIcon'], false)

module.exports = React.memo((props) => {
   return <svg
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      role='img'
      width='1em'
      height='1em'
      preserveAspectRatio='xMidYMid meet'
      viewBox='0 0 24 24'
      className={icon}
      {...props}
   >
      <g fill='none'>
         <path
            d='M12 7c1.714 0 2-1.34 2-2.444C14 3.45 13.262 1.5 12 1.5s-2 1.951-2 3.056C10 5.66 10.286 7 12 7z'
            fill='currentColor'
         />
         <path
            d='M3.5 10.25A2.25 2.25 0 0 1 5.75 8h12.5a2.25 2.25 0 0 1 2.25 2.25v.875l-3.634 2.726a1.25 1.25 0 0 1-1.384.077l-2.04-1.2a2.75 2.75 0 0 0-2.884.06l-1.761 1.136a1.25 1.25 0 0 1-1.35.003L3.5 11.408V10.25z'
            fill='currentColor'
         />
         <path d='M3.5 13.188V18.5h-.75a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5h-.75V13l-2.734 2.05a2.75 2.75 0 0 1-3.044.171l-2.04-1.2a1.25 1.25 0 0 0-1.311.027l-1.76 1.136a2.75 2.75 0 0 1-2.971.008L3.5 13.187z'
            fill='currentColor'
         />
      </g>
   </svg>
})