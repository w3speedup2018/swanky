setTimeout(function(){$("body.customers").css("opacity","1")},500),$(document).on("click",".subscription-products-update .scent-DisplayList .scent-displayList_qtyToggle .qtyButton",function(){var s=$(this).closest(".subscription-products-update"),t=parseInt($(this).siblings("input.qtyScreen").val()),a=parseInt(s.find("select.edit_new_bar_value_bar").val()),e=parseInt(s.find("select.edit_new_bar_value_bar").data("rem")),i=$(this).closest(".scent-DisplayItem").find(".current_product_description").data("match-attr"),d=$(this).closest(".scent-DisplayItem").find(".scentTitle").text().trim();if($(this).hasClass("increase")&&a!=e&&t>=0&&e<a){t++,e++;var r='<a href="#" class="selected-soap-item" style=""><div class="image" data-scentTitle="'+d+'" data-img-url="'+i+'" style="background-image: url('+i+');"></div> <div class="title-wrapper"><div class="title">'+d+'</div></div> <span style="display:none;" class="removeScent_btn">\u2715</span></a>';s.find("div[data-carousel] .carousel").prepend(r)}else $(this).hasClass("decrease")&&t!=0&&t>0&&e>0&&e!=0&&(t--,e--,s.find("div[data-carousel] .carousel .image").each(function(){if($(this).data("img-url")==i&&$(this).data("scenttitle")==d)return $(this).parent().remove(),!1}));$(this).siblings("input.qtyScreen").val(t),s.find("h4.text-limitations span").text("("+e+" / "+a+" Soaps)"),s.find("select.edit_new_bar_value_bar").data("rem",e),$(this).closest(".scent-DisplayItem")[0].hasAttribute("data-item-value")&&$(this).closest(".scent-DisplayItem").data("item-value")!=t?$(this).closest(".scent-DisplayItem").addClass("flagfalse"):$(this).closest(".scent-DisplayItem")[0].hasAttribute("data-item-value")==!1&&t>0?$(this).closest(".scent-DisplayItem").addClass("flagfalse"):$(this).closest(".scent-DisplayItem").removeClass("flagfalse")}),$(document).ready(function(){var s=$(".subscription-products-update .scent-DisplayList .scent-DisplayItem"),t=$(".subscription-products-update .scent-DisplayList .scent-DisplayItem[data-item-value]").length;s.each(function(a){var e=$(this).closest(".subscription-products-update"),i=parseInt(e.find("select.edit_new_bar_value_bar").val()),d=parseInt($(this).data("item-value"));if(d&&d>0){var r=$(this).find(".current_product_description").data("match-attr"),n=$(this).find(".scentTitle").text().trim();e.find(".scentEditor_image .scentEditor_card p").text($(this).closest(".scent-DisplayItem").find(".current_product_description").text());for(var c='<a href="#" class="selected-soap-item" style=""><div class="image" data-scentTitle="'+n+'" data-img-url="'+r+'" style="background-image: url('+r+');"></div> <div class="title-wrapper"><div class="title">'+n+'</div></div> <span style="display:none;" class="removeScent_btn">\u2715</span></a>',l=0,o=d;l<o;l++)e.find("div[data-carousel] .carousel").prepend(c);t==a&&(e.find(".scentEditor_image img").attr("src",r),e.find(".scentEditor_image .scentEditor_card p").text($(this).find(".current_product_description").text().trim()))}e.find("h4.text-limitations span").text("("+e.find(".carousel .image").length+" / "+i+" Soaps)"),e.find("select.edit_new_bar_value_bar").data("rem",e.find(".carousel .image").length)})}),$(document).on("click",".carousel .selected-soap-item",function(s){s.preventDefault();var t=$(this).closest(".subscription-products-update"),a=parseInt(t.find("select.edit_new_bar_value_bar").val()),e=$(this).find(".image").data("scenttitle"),i=$(this).find(".image").data("img-url"),d=parseInt(t.find("select.edit_new_bar_value_bar").data("rem")),r=!1;if(t.find(".scent-DisplayList .scent-DisplayItem").each(function(){if(i==$(this).find(".current_product_description").data("match-attr")&&e==$(this).find("p.scentTitle").text().trim()){r=!0;var c=parseInt($(this).find(".scent-displayList_qtyToggle input.qtyScreen").val());c--,$(this).find(".scent-displayList_qtyToggle input.qtyScreen").val(c),d--,$(this)[0].hasAttribute("data-item-value")&&$(this).data("item-value")!=c?$(this).addClass("flagfalse"):$(this)[0].hasAttribute("data-item-value")==!1&&c>0?$(this).addClass("flagfalse"):$(this).removeClass("flagfalse")}}),r){$(this).remove(),t.find("select.edit_new_bar_value_bar").data("rem",d),t.find("h4.text-limitations span").text("("+d+" / "+a+" Soaps)");var n=t.closest(".data_edit__style_line_date");t.find(".flagfalse").length>0?(n.find(".subscription_bars_edit_btns a.subscription_bars_close").hide(),n.find(".subscription_bars_edit_btns a.save_subscription_save_edit").parent().removeClass("hide hidden"),n.find(".subscription_bars_edit_btns a.cancel_subscription_skip_edit").parent().removeClass("hide hidden"),n.find("button.btn.btn-block.btn-primary.w-100.action_button_type").show()):(n.find(".subscription_bars_edit_btns a.subscription_bars_close").show(),n.find(".subscription_bars_edit_btns a.save_subscription_save_edit").parent().addClass("hide hidden"),n.find(".subscription_bars_edit_btns a.cancel_subscription_skip_edit").parent().addClass("hide hidden"),n.find("button.btn.btn-block.btn-primary.w-100.action_button_type").hide())}d!=a?n.find(".save-btn-to-edit").removeClass("locked").removeAttr("disabled","disabled"):n.find(".save-btn-to-edit").addClass("locked").attr("disabled","disabled")}),$(document).on("change",".subscription-products-update select.edit_new_bar_value_bar",function(){var s=parseInt($(this).data("rem")),t=parseInt(this.value),a=$(this).closest(".subscription-products-update"),e=$(this).closest(".data_edit__style_line_date");if(s>t){var i=s-t;$(".carousel .selected-soap-item").each(function(d){var r=$(this).find(".image").data("scenttitle"),n=$(this).find(".image").data("img-url");if(i>d){var c=!1;a.find(".scent-DisplayList .scent-DisplayItem").each(function(){if(n==$(this).find(".current_product_description").data("match-attr")&&r==$(this).find("p.scentTitle").text().trim()){var l=parseInt($(this).find(".scent-displayList_qtyToggle input.qtyScreen").val());return l--,$(this).find(".scent-displayList_qtyToggle input.qtyScreen").val(l),s--,c=!0,!1}}),c&&$(this).remove()}else if(i==d)return a.find(".scent-DisplayList .scent-DisplayItem").each(function(){if(n==$(this).find(".current_product_description").data("match-attr")&&r==$(this).find("p.scentTitle").text().trim())return a.find(".scentEditor_image img").attr("src",$(this).find(".current_product_description").data("match-attr")),a.find(".scentEditor_image .scentEditor_card p").text($(this).find(".current_product_description").text().trim()),!1}),!1}),$(this).data("rem",s)}a.find("h4.text-limitations span").text("("+s+" / "+t+" Soaps)"),$(this).data("rem")!=this.value?e.find(".save-btn-to-edit").addClass("locked").attr("disabled","disabled"):e.find(".save-btn-to-edit").removeClass("locked").removeAttr("disabled","disabled")}),$(document).on("click",".scent-DisplayItem",function(){$(".customers .edit-scents-outer").hide(),$(".data-carousel-text").show(),$(".scentEditor_image").show(),$(this).closest(".subscription-products-update").find(".scentEditor_image img").attr("src",$(this).find(".current_product_description").data("match-attr")),$(this).closest(".subscription-products-update").find(".scentEditor_image .scentEditor_card p").text($(this).find(".current_product_description").text().trim());var s=$(this).closest(".subscription-products-update"),t=parseInt(s.find("select.edit_new_bar_value_bar").val()),a=$(this).find(".image").data("scenttitle"),e=parseInt(s.find("select.edit_new_bar_value_bar").data("rem")),i=$(this).closest(".data_edit__style_line_date");i.find(".flagfalse").length>0?(i.find(".subscription_bars_edit_btns a.subscription_bars_close").hide(),i.find(".subscription_bars_edit_btns a.save_subscription_save_edit").parent().removeClass("hide hidden"),i.find(".subscription_bars_edit_btns a.cancel_subscription_skip_edit").parent().removeClass("hide hidden"),i.find("button.btn.btn-block.btn-primary.w-100.action_button_type").show()):(i.find(".subscription_bars_edit_btns a.subscription_bars_close").show(),i.find(".subscription_bars_edit_btns a.save_subscription_save_edit").parent().addClass("hide hidden"),i.find(".subscription_bars_edit_btns a.cancel_subscription_skip_edit").parent().addClass("hide hidden"),i.find("button.btn.btn-block.btn-primary.w-100.action_button_type").hide()),e!=t?i.find(".save-btn-to-edit").addClass("locked").attr("disabled","disabled"):i.find(".save-btn-to-edit").removeClass("locked").removeAttr("disabled","disabled")}),$(document).on("mouseenter",".carousel .selected-soap-item .image",function(){var s=$(this).closest(".subscription-products-update"),t=$(this).data("scenttitle"),a=$(this).data("img-url");s.find(".scent-DisplayList .scent-DisplayItem").each(function(){if(a==$(this).find(".current_product_description").data("match-attr")&&t==$(this).find("p.scentTitle").text().trim())return s.find(".scentEditor_image img").attr("src",$(this).find(".current_product_description").data("match-attr")),s.find(".scentEditor_image .scentEditor_card p").text($(this).find(".current_product_description").text().trim()),!1})}),$(document).on("change",".edit_new_bar_value",function(){var s=!1,t=$(this).closest(".data_edit__style_line_date"),a=$(this).closest(".data_edit__style_line_date");$(".edit_new_bar_value option:selected").each(function(){if($(this).parents().hasClass("edit_new_bar_value_bar")){$(this).closest(".data_edit__style_line_date").find(".product-bars .product_image img").attr("src",$(this).data("bar-featured-img")),$(this).closest(".data_edit__style_line_date").find(".product-bars-title-bg").text($(this).val()+" Bars");var e=$(this).closest(".data_edit__style_line_date").find(".product-bars-title-bg");s==!1&&e.data("title").trim()!=e.text().trim()?(s=!0,$(this).parent().addClass("flagfalse")):(s=!1,$(this).parent().removeClass("flagfalse"))}else if($(this).parents().hasClass("edit_new_bar_value_del")){var e=$(this).closest(".data_edit__style_line_date");$(this).closest(".data_edit__style_line_date").find(".product-bars-plan span").text($(this).val()),e.find(".product-bars-plan").data("plan").toLowerCase().trim()!=e.find(".product-bars-plan span").text().toLowerCase().trim()?$(this).parent().addClass("flagfalse"):$(this).parent().removeClass("flagfalse")}}),t.find(".flagfalse").length>0?(t.find(".subscription_bars_edit_btns a.subscription_bars_close").hide(),t.find(".subscription_bars_edit_btns a.save_subscription_save_edit").parent().removeClass("hide hidden"),t.find(".subscription_bars_edit_btns a.cancel_subscription_skip_edit").parent().removeClass("hide hidden"),t.find("button.btn.btn-block.btn-primary.w-100.action_button_type").show()):(t.find(".subscription_bars_edit_btns a.subscription_bars_close").show(),t.find(".subscription_bars_edit_btns a.save_subscription_save_edit").parent().addClass("hide hidden"),t.find(".subscription_bars_edit_btns a.cancel_subscription_skip_edit").parent().addClass("hide hidden"),t.find("button.btn.btn-block.btn-primary.w-100.action_button_type").hide())}),$(document).on("click",".cancel_subscription_skip_edit",function(){location.reload()}),$(document).on("click",".cancel_subscription",function(){$(this).closest(".data_edit__style_line_date").find(".cancel_subscription_popup").addClass("active")}),$(document).on("click",".close_x, .no_proceed_cancel",function(){$(this).closest(".data_edit__style_line_date").find(".cancel_subscription_popup").removeClass("active")}),$(document).on("click",".skip_subscription_skip_edit",function(){$(this).closest(".data_edit__style_line_date").find(".skip_subscription_skip_edit_popup").addClass("active")}),$(document).on("click",".close_x_skip, .no_proceed_skip_cancel",function(){$(this).closest(".data_edit__style_line_date").find(".skip_subscription_skip_edit_popup").removeClass("active")}),$(document).on("click",".SW_refill_tonight",function(){$(this).closest(".data_edit__style_line_date").find(".refill_subscription_popup").addClass("active")}),$(document).on("click",".refill_close_x, .no_proceed_refill",function(){$(this).closest(".data_edit__style_line_date").find(".refill_subscription_popup").removeClass("active")}),$(document).on("click",".subscription_bars_edit",function(){$(this).closest(".data_edit__style_line_date").find(".scentEditor_selects").prev(".edit-scents-outer").show()}),$(document).on("click",".edit_scents",function(){$(this).closest(".scentEditor_selects").prev(".edit-scents-outer").show(),$(this).closest(".scentEditor_selects").prev().prev(".data-carousel-text").hide(),$(this).closest(".scentEditor_selects").prev().prev().prev(".scentEditor_image").hide()}),$(document).on("click",".edit-scents-info",function(){$(this).parent().addClass("popup-active")}),$(document).on("click",".close-pop",function(){$(".scentspop-container").removeClass("popup-active")});
//# sourceMappingURL=/s/files/1/1283/2241/t/79/assets/swanky-bar-boxes.js.map?v=1648504277