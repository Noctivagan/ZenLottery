var a = alice.init();

function bounceAlice (ele)
{
	//a.spin(ele, "left", 1, 0, "1000ms", "linear", "0ms", "infinite", "normal", "running");
	a.dance(ele, 360, "500ms", "linear", "0ms", "infinite", "normal", "running");
}

function slideAlice (ele)
{
	a.slide(ele, "left", 0, "2500ms", "ease-in-out", "0ms", "infinite", "alternate", "running");
}
