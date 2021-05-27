import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'
import { makeStyles } from '@material-ui/core/styles';

export default function B1(props) {
  const useStyles = makeStyles({
    i: {
      backgroundSize: "24px 24px"
    }
  })  
  const classes = useStyles()

  return (
    <SvgIcon {...props} className = {classes.i} width="24px" height="24px" viewBox="0 0 250 250" >
<rect class="st0" width="250" height="250"/>
<path class="st1" d="M250,125c0,69-56,125-125,125S0,194,0,125S56,0,125,0S250,56,250,125z"/>
<rect class="st2" width="125" height="250"/>
<g>
	<path class="st3" d="M61.7,0.4c0,0,133.2,116.4-0.4,249.6L61.7,0.4z"/>
	<path class="st4" d="M61.7,0.4c0,0-133.6,116-0.4,249.6L61.7,0.4z"/>
</g>
    </SvgIcon>
  )
}

