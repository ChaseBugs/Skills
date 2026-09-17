// Excel Power Query: create a Blank Query, open Advanced Editor, and paste this.
// Set BaseUrl and Dataset. On first refresh select Basic authentication:
// username: token; password: your reporting key. Do not put the key in this file.
let
    BaseUrl = "https://skills.example.com",
    Dataset = "qualifications",
    GetPage = (Page as number) as record => Json.Document(Web.Contents(BaseUrl,
        [RelativePath = "api/reports/" & Dataset,
         Query = [page = Text.From(Page), pageSize = "1000"]])),
    Pages = List.Generate(
        () => [Page = 1, Result = GetPage(1)],
        each [Result] <> null,
        each if [Result][hasMore] then [Page = [Page] + 1, Result = GetPage([Page] + 1)]
             else [Page = [Page] + 1, Result = null],
        each [Result][data]),
    Combined = List.Combine(Pages),
    Result = Table.FromRecords(Combined)
in
    Result
