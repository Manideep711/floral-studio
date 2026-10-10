import {useId,type CSSProperties} from "react";
import {LOGO_PATH,LOGO_VIEWBOX} from "@/lib/brand/logo";

// Each trace follows its own asymmetric petal in the supplied artwork.
// Open ends stop at the logo's tips; no completion fill changes their thickness.
const petalTraces=[
 "M536 496 C545 464 565 438 572 409 C591 355 559 313 519 313 C473 308 438 348 447 387 L452 407",
 "M488 497 C477 466 459 439 435 421 C398 391 364 385 338 410 C312 435 313 469 339 493 C350 507 367 515 382 515",
 "M475 521 C426 505 375 522 348 549 C312 581 316 614 337 640 C363 664 407 653 431 638 L438 621",
 "M491 553 C475 581 451 624 449 653 C444 694 477 722 513 720 C552 720 580 680 575 648 L568 637",
 "M531 551 C555 597 582 636 611 649 C648 669 685 649 698 622 C720 580 686 544 648 535",
 "M547 523 C586 538 629 529 660 512 C705 485 718 447 698 417 C676 383 631 384 600 405 L586 420",
];
export default function LogoSequence() {
 const id=useId().replace(/:/g,"");
 return <svg className="logo-sequence" viewBox={LOGO_VIEWBOX} aria-hidden="true">
  <defs>
   <mask id={`${id}-petals`} maskUnits="userSpaceOnUse" x="280" y="280" width="470" height="470">
    {petalTraces.map((trace,i)=><path key={i} className="sequence-petal-trace" d={trace} pathLength="1" fill="none" stroke="white" strokeWidth="52" strokeLinecap="butt" style={{"--trace-delay":`${400+i*210}ms`} as CSSProperties}/>)}
   </mask>
   <mask id={`${id}-center`} maskUnits="userSpaceOnUse" x="280" y="280" width="470" height="470"><circle className="sequence-center-trace" cx="511" cy="521" r="37" pathLength="1" fill="none" stroke="white" strokeWidth="28" transform="rotate(-90 511 521)"/></mask>
  </defs>
  <path d={LOGO_PATH} fill="currentColor" opacity=".1"/>
  <path d={LOGO_PATH} fill="currentColor" mask={`url(#${id}-petals)`}/>
  <path d={LOGO_PATH} fill="currentColor" mask={`url(#${id}-center)`}/>
 </svg>;
}
