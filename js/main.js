$(function() {
    $(".gwfd-font-dropdown li a").click(function(){
        var selText = $(this).html();
        $(this).closest('div').find('button[data-toggle="dropdown"]').html(selText + '  <span class="pull-right"><span class="caret"></span></span>');

    });
});
