import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Strings } from '@ephox/katamari';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import { TextContent } from '@ephox/sugar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.FontSelectTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sAssertSelectBoxDisplayValue = function (editor, title, expectedValue) {
    return Chain.asStep(Element.fromDom(document.body), [
      UiFinder.cFindIn('*[aria-label="' + title + '"]'),
      Chain.mapper(Fun.compose(Strings.trim, TextContent.get)),
      Assertions.cAssertEq('Should be the expected display value', expectedValue)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Font family and font size on initial page load', GeneralSteps.sequence([
        sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '32pt'),
        sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Helvetica')
      ])),

      Logger.t('Font family and font size on paragraph', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sFocus,
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged,
        sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '24pt'),
        sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Arial')
      ])),

      Logger.t('Font family and font size on paragraph with styles', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="font-family: Times; font-size: 17px;">a</p>'),
        tinyApis.sFocus,
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged,
        // the following one should pick up 12.75pt, although there's a rounded 13pt in the dropdown as well
        sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '12.75pt'),
        sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Times')
      ]))
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    toolbar: 'fontsizeselect fontselect',
    content_style: [
      '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
      '.mce-content-body p { font-family: Arial; font-size: 32px; }'
    ].join(''),
    fontsize_formats: '12pt 12.75pt 13pt 32pt'
  }, success, failure);
});
