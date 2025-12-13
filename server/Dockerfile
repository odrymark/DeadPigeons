FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src
RUN apk add --no-cache tzdata

COPY ["./", "."]
RUN dotnet publish "Api/Api.csproj" \
    -c Release \
    -o /app/publish \
    --runtime linux-musl-x64 \
    --self-contained true \
    /p:PublishSingleFile=true

FROM mcr.microsoft.com/dotnet/runtime-deps:9.0-alpine
WORKDIR /app

RUN apk add --no-cache tzdata
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["./Api"]