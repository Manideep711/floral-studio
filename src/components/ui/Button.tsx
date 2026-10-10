import type {ButtonHTMLAttributes} from "react";
type Props=ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"primary"|"secondary"|"danger"};
export default function Button({variant="primary",className="",type="button",...props}:Props){return <button type={type} className={`${variant}-button ${className}`.trim()} {...props}/>;}
