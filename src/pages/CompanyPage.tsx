

interface ICompanyPage{
    alias: string;
}

export function CompanyPage({ alias }: ICompanyPage) {
  return (
    <div>
      <h1>Company Page {alias}</h1>
      {/* Company details and photos will be displayed here */}
    </div>
  );
}
