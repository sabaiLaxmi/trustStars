import sys

with open('app/routes/app.forms.$id.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add isFree
code = code.replace(
    '  const hasPro = currentPlan === "PRO";',
    '  const hasPro = currentPlan === "PRO";\n  const isFree = currentPlan === "FREE";'
)

# 2. Default colors and useState
code = code.replace(
    '  const DEFAULT_TEXT_COLOR = "#FFFFFF";',
    '  const DEFAULT_TEXT_COLOR = isFree ? "#000000" : "#FFFFFF";'
)
code = code.replace(
    '  const DEFAULT_BG_COLOR = "#008060";',
    '  const DEFAULT_BG_COLOR = isFree ? "#FFFFFF" : "#008060";'
)
code = code.replace(
    '  const [textColor, setTextColor] = useState(form.textColor || DEFAULT_TEXT_COLOR);',
    '  const [textColor, setTextColor] = useState(isFree ? "#000000" : (form.textColor || DEFAULT_TEXT_COLOR));'
)
code = code.replace(
    '  const [bgColor, setBgColor] = useState(form.backgroundColor || form.accentColor || DEFAULT_BG_COLOR);',
    '  const [bgColor, setBgColor] = useState(isFree ? "#FFFFFF" : (form.backgroundColor || form.accentColor || DEFAULT_BG_COLOR));'
)

# 3. useEffect
code = code.replace(
    '    setBgColor(form?.backgroundColor || form?.accentColor || DEFAULT_BG_COLOR);',
    '    setBgColor(isFree ? "#FFFFFF" : (form?.backgroundColor || form?.accentColor || DEFAULT_BG_COLOR));'
)
code = code.replace(
    '    setTextColor(form?.textColor || DEFAULT_TEXT_COLOR);',
    '    setTextColor(isFree ? "#000000" : (form?.textColor || DEFAULT_TEXT_COLOR));'
)

# 4. Hide 'Choose a Design'
code = code.replace(
    '                      <BlockStack gap="200">\n                        <InlineStack align="space-between" blockAlign="center">\n                          <Text variant="headingSm" as="h3">Choose a Design</Text>',
    '                      {!isFree && (\n                        <>\n                          <BlockStack gap="200">\n                            <InlineStack align="space-between" blockAlign="center">\n                              <Text variant="headingSm" as="h3">Choose a Design</Text>'
)

code = code.replace(
    '                      <Divider />\n\n                      <BlockStack gap="200">\n                        <Text variant="headingSm" as="h3">Text Color</Text>',
    '                          <Divider />\n                        </>\n                      )}\n\n                      <BlockStack gap="200">\n                        <Text variant="headingSm" as="h3">Text Color</Text>'
)

# 5. Lock text color
code = code.replace(
    '                        <InlineStack gap="200">\n                          {TEXT_COLORS.map(color => (\n                            <div key={color} role="button" tabIndex={0} onKeyDown={() => setTextColor(color)} onClick={() => setTextColor(color)}\n                              style={{\n                                width: \'32px\', height: \'32px\', borderRadius: \'50%\',\n                                backgroundColor: color, cursor: \'pointer\',\n                                border: textColor === color ? \'3px solid #E5E7EB\' : \'1px solid #e3e3e3\',\n                                boxShadow: textColor === color ? \'0 0 0 2px #202223\' : \'none\'\n                              }}\n                            />\n                          ))}\n                        </InlineStack>',
    '''                        {isFree ? (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#000000', border: '3px solid #E5E7EB', boxShadow: '0 0 0 2px #202223' }} />
                        ) : (
                          <InlineStack gap="200">
                            {TEXT_COLORS.map(color => (
                              <div key={color} role="button" tabIndex={0} onKeyDown={() => setTextColor(color)} onClick={() => setTextColor(color)}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  backgroundColor: color, cursor: 'pointer',
                                  border: textColor === color ? '3px solid #E5E7EB' : '1px solid #e3e3e3',
                                  boxShadow: textColor === color ? '0 0 0 2px #202223' : 'none'
                                }}
                              />
                            ))}
                          </InlineStack>
                        )}'''
)

# 6. Lock background color
code = code.replace(
    '                        <InlineStack gap="200">\n                          {BG_COLORS.map(color => (\n                            <div key={color} role="button" tabIndex={0} onKeyDown={() => setBgColor(color)} onClick={() => setBgColor(color)}\n                              style={{\n                                width: \'32px\', height: \'32px\', borderRadius: \'50%\',\n                                backgroundColor: color, cursor: \'pointer\',\n                                border: bgColor === color ? \'3px solid #E5E7EB\' : \'1px solid #e3e3e3\',\n                                boxShadow: bgColor === color ? \'0 0 0 2px #202223\' : \'none\'\n                              }}\n                            />\n                          ))}\n                        </InlineStack>',
    '''                        {isFree ? (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '3px solid #E5E7EB', boxShadow: '0 0 0 2px #202223' }} />
                        ) : (
                          <InlineStack gap="200">
                            {BG_COLORS.map(color => (
                              <div key={color} role="button" tabIndex={0} onKeyDown={() => setBgColor(color)} onClick={() => setBgColor(color)}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  backgroundColor: color, cursor: 'pointer',
                                  border: bgColor === color ? '3px solid #E5E7EB' : '1px solid #e3e3e3',
                                  boxShadow: bgColor === color ? '0 0 0 2px #202223' : 'none'
                                }}
                              />
                            ))}
                          </InlineStack>
                        )}'''
)

# 7. Hide Custom Design save button
code = code.replace(
    '                      {isCustomCombo && (',
    '                      {isCustomCombo && !isFree && ('
)

# 8. Hide Theme Access, Image Upload, Remove Branding
code = code.replace(
    '                <Divider />\n\n                <BlockStack gap="200">\n                  <InlineStack align="space-between" blockAlign="center">\n                    <InlineStack gap="200" blockAlign="center">\n                      <Text tone={hasStarter ? "base" : "subdued"}>Theme Access</Text>',
    '                {!isFree && <Divider />}\n\n                {!isFree && (\n                  <BlockStack gap="200">\n                    <InlineStack align="space-between" blockAlign="center">\n                      <InlineStack gap="200" blockAlign="center">\n                        <Text tone={hasStarter ? "base" : "subdued"}>Theme Access</Text>'
)

code = code.replace(
    '                      </InlineStack>\n                    </Modal.Section>\n                  </Modal>\n                </BlockStack>\n\n                <Divider />\n\n                {/* Image Upload */}\n                {imageLimit > 0 && (\n                  <BlockStack gap="200">',
    '                      </InlineStack>\n                    </Modal.Section>\n                  </Modal>\n                  </BlockStack>\n                )}\n\n                {imageLimit > 0 && !isFree && <Divider />}\n\n                {/* Image Upload */}\n                {imageLimit > 0 && !isFree && (\n                  <BlockStack gap="200">'
)

code = code.replace(
    '                      )}                                \n                    </div>                              \n                  </BlockStack>                         \n                )}                                      \n                                                        \n                <Divider />                             \n                                                        \n                {/* Branding Removal */}                \n                <BlockStack gap="200">                  ',
    '                      )}\n                    </div>\n                  </BlockStack>\n                )}\n\n                {!isFree && <Divider />}\n\n                {/* Branding Removal */}\n                {!isFree && (\n                <BlockStack gap="200">'
)

# Try replacing without spaces if previous failed
code = code.replace(
    '                      )}\n                    </div>\n                  </BlockStack>\n                )}\n\n                <Divider />\n\n                {/* Branding Removal */}\n                <BlockStack gap="200">',
    '                      )}\n                    </div>\n                  </BlockStack>\n                )}\n\n                {!isFree && <Divider />}\n\n                {/* Branding Removal */}\n                {!isFree && (\n                <BlockStack gap="200">'
)

code = code.replace(
    '                    <Checkbox label="Remove TrustStars branding" checked={removeBranding} onChange={setRemoveBranding} disabled={!hasPro} />\n                  </div>\n                </BlockStack>\n\n              </BlockStack>',
    '                    <Checkbox label="Remove TrustStars branding" checked={removeBranding} onChange={setRemoveBranding} disabled={!hasPro} />\n                  </div>\n                </BlockStack>\n                )}\n\n              </BlockStack>'
)

with open('app/routes/app.forms.$id.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("File updated successfully")
