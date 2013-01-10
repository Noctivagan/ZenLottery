//functions specific to Draw.html
function getNumDraws()
{
	var ele = document.getElementById('rngNumDraw');
	if(ele)
	{
		gblNumDraws = ele.value;
		return gblNumDraws;
	}
	else
	{
		return 0;
	}
	
}
