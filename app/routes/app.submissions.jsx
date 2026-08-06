import { useLoaderData, useNavigate, data } from "react-router";
import { authenticate } from "../shopify.server";
import { Page, Layout, Card, IndexTable, useIndexResourceState, Text, Badge, TextField, BlockStack, InlineStack, Select } from "@shopify/polaris";
import { useState, useCallback, useMemo } from "react";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const submissions = await db.submission.findMany({
    where: { shop: session.shop },
    include: {
      form: true,
      values: {
        include: { field: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return data({ submissions });
};

export default function Submissions() {
  const { submissions } = useLoaderData();
  const navigate = useNavigate();
  
  const [queryValue, setQueryValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const parsedSubmissions = useMemo(() => {
    return submissions.map(sub => {
      let name = "Anonymous";
      let email = "No Email";
      
      sub.values.forEach(val => {
        const type = val.field.type;
        const label = val.field.label.toLowerCase();
        
        if (type === 'EMAIL' || label.includes('email')) {
          email = val.value;
        } else if (label.includes('name')) {
          name = val.value;
        }
      });
      
      return {
        ...sub,
        displayName: name,
        displayEmail: email,
        date: new Date(sub.createdAt).toLocaleDateString()
      };
    });
  }, [submissions]);

  const filteredSubmissions = parsedSubmissions.filter(sub => {
    if (queryValue) {
      const search = queryValue.toLowerCase();
      if (!sub.displayName.toLowerCase().includes(search) && !sub.displayEmail.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (statusFilter !== 'ALL') {
      if (sub.status !== statusFilter) {
        return false;
      }
    }
    return true;
  });

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(filteredSubmissions);

  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Form Name", "Name", "Email", "Date", "Status"];
    const rows = filteredSubmissions.map(sub => [
      sub.id,
      `"${sub.form.title}"`,
      `"${sub.displayName}"`,
      `"${sub.displayEmail}"`,
      sub.date,
      sub.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredSubmissions]);

  const rowMarkup = filteredSubmissions.map(
    (sub, index) => (
      <IndexTable.Row
        id={sub.id}
        key={sub.id}
        selected={selectedResources.includes(sub.id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">{sub.displayName}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{sub.displayEmail}</IndexTable.Cell>
        <IndexTable.Cell>{sub.form.title}</IndexTable.Cell>
        <IndexTable.Cell>{sub.date}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={sub.status === 'NEW' ? "info" : "success"}>{sub.status}</Badge>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page
      title="Submissions"
      primaryAction={{ content: 'Export CSV', onAction: handleExportCSV, disabled: filteredSubmissions.length === 0 }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <div style={{ padding: '16px', borderBottom: '1px solid #ebebeb' }}>
              <InlineStack gap="400" align="start">
                <div style={{ flex: 1 }}>
                  <TextField
                    labelHidden
                    label="Search submissions"
                    placeholder="Search by name or email..."
                    value={queryValue}
                    onChange={setQueryValue}
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => setQueryValue('')}
                  />
                </div>
                <div>
                  <Select
                    labelHidden
                    label="Filter by Status"
                    options={[
                      { label: 'All Statuses', value: 'ALL' },
                      { label: 'New', value: 'NEW' },
                      { label: 'Read', value: 'READ' },
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </InlineStack>
            </div>
            <IndexTable
              resourceName={{ singular: 'submission', plural: 'submissions' }}
              itemCount={filteredSubmissions.length}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: 'Name' },
                { title: 'Email' },
                { title: 'Form Name' },
                { title: 'Date' },
                { title: 'Status' },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
