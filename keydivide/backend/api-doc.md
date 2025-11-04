---
title: API Интернет-магазина эргономичных клавиатур v1.0.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="api-">API Интернет-магазина эргономичных клавиатур v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

REST API для управления каталогом клавиатур, свитчами, заказами и пользователями

Base URLs:

* <a href="http://localhost:5000">http://localhost:5000</a>

# Authentication

- HTTP Authentication, scheme: bearer 

<h1 id="api--default">Default</h1>

## Получить список всех товаров

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/api/products \
  -H 'Accept: application/json'

```

```http
GET http://localhost:5000/api/products HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:5000/api/products',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:5000/api/products',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:5000/api/products', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/api/products', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/api/products");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/api/products", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/products`

> Example responses

> 200 Response

```json
[
  {
    "id": 0,
    "name": "string",
    "price": 0
  }
]
```

<h3 id="получить-список-всех-товаров-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Список товаров|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Ошибка сервера|None|

<h3 id="получить-список-всех-товаров-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» id|integer|false|none|none|
|» name|string|false|none|none|
|» price|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Регистрация нового пользователя

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:5000/register \
  -H 'Content-Type: application/json'

```

```http
POST http://localhost:5000/register HTTP/1.1
Host: localhost:5000
Content-Type: application/json

```

```javascript
const inputBody = '{
  "login": "string",
  "email": "user@example.com",
  "surname": "string",
  "name": "string",
  "password": "pa$$word"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('http://localhost:5000/register',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json'
}

result = RestClient.post 'http://localhost:5000/register',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json'
}

r = requests.post('http://localhost:5000/register', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:5000/register', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/register");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:5000/register", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /register`

> Body parameter

```json
{
  "login": "string",
  "email": "user@example.com",
  "surname": "string",
  "name": "string",
  "password": "pa$$word"
}
```

<h3 id="регистрация-нового-пользователя-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» login|body|string|true|none|
|» email|body|string(email)|true|none|
|» surname|body|string|false|none|
|» name|body|string|false|none|
|» password|body|string(password)|true|none|

<h3 id="регистрация-нового-пользователя-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Пользователь успешно создан|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Пользователь с таким логином или email уже существует|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Ошибка сервера|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="api--admin">Admin</h1>

Админские запросы

## Добавление новой клавиатуры

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:5000/admin/products \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST http://localhost:5000/admin/products HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "name": "string",
  "description": "string",
  "price": 0,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/products',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post 'http://localhost:5000/admin/products',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('http://localhost:5000/admin/products', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:5000/admin/products', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/products");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:5000/admin/products", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /admin/products`

Создание новой клавиатуры в каталоге магазина

> Body parameter

```json
{
  "name": "string",
  "description": "string",
  "price": 0,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  }
}
```

<h3 id="добавление-новой-клавиатуры-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» name|body|string|true|Название клавиатуры|
|» description|body|string|true|Описание клавиатуры|
|» price|body|number|true|Цена клавиатуры|
|» image_url|body|string|false|URL изображения клавиатуры|
|» category|body|string|true|Категория клавиатуры|
|» in_stock|body|boolean|false|Наличие на складе|
|» specifications|body|object|false|none|
|»» layout|body|string|false|Раскладка клавиатуры|
|»» connection_type|body|string|false|Тип подключения|
|»» battery_life|body|string|false|Время работы от батареи|
|»» weight|body|string|false|Вес клавиатуры|

> Example responses

> 201 Response

```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "price": 0.1,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  },
  "created_at": "2019-08-24T14:15:22Z"
}
```

<h3 id="добавление-новой-клавиатуры-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Клавиатура успешно создана|[ProductDetail](#schemaproductdetail)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Невалидные данные клавиатуры|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Недостаточно прав для выполнения операции|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Обновление информации о клавиатуре

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:5000/admin/products/{id} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
PUT http://localhost:5000/admin/products/{id} HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "name": "string",
  "description": "string",
  "price": 0,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/products/{id}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.put 'http://localhost:5000/admin/products/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.put('http://localhost:5000/admin/products/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:5000/admin/products/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/products/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:5000/admin/products/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /admin/products/{id}`

Изменение данных существующей клавиатуры в каталоге

> Body parameter

```json
{
  "name": "string",
  "description": "string",
  "price": 0,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  }
}
```

<h3 id="обновление-информации-о-клавиатуре-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ID клавиатуры|
|body|body|object|true|none|
|» name|body|string|false|Название клавиатуры|
|» description|body|string|false|Описание клавиатуры|
|» price|body|number|false|Цена клавиатуры|
|» image_url|body|string|false|URL изображения клавиатуры|
|» category|body|string|false|Категория клавиатуры|
|» in_stock|body|boolean|false|Наличие на складе|
|» specifications|body|object|false|none|
|»» layout|body|string|false|Раскладка клавиатуры|
|»» connection_type|body|string|false|Тип подключения|
|»» battery_life|body|string|false|Время работы от батареи|
|»» weight|body|string|false|Вес клавиатуры|

> Example responses

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "price": 0.1,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  },
  "created_at": "2019-08-24T14:15:22Z"
}
```

<h3 id="обновление-информации-о-клавиатуре-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Клавиатура успешно обновлена|[ProductDetail](#schemaproductdetail)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Клавиатура не найдена|[Error](#schemaerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Удаление клавиатуры

> Code samples

```shell
# You can also use wget
curl -X DELETE http://localhost:5000/admin/products/{id} \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
DELETE http://localhost:5000/admin/products/{id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/products/{id}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.delete 'http://localhost:5000/admin/products/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.delete('http://localhost:5000/admin/products/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('DELETE','http://localhost:5000/admin/products/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/products/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("DELETE", "http://localhost:5000/admin/products/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`DELETE /admin/products/{id}`

Удаление клавиатуры из каталога магазина

<h3 id="удаление-клавиатуры-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ID клавиатуры|

> Example responses

> 200 Response

```json
{
  "message": "Клавиатура успешно удалена"
}
```

<h3 id="удаление-клавиатуры-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Клавиатура успешно удалена|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Клавиатура не найдена|[Error](#schemaerror)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Невозможно удалить клавиатуру, так как она есть в активных заказах|[Error](#schemaerror)|

<h3 id="удаление-клавиатуры-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» message|string|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Добавление нового свитча

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:5000/admin/switches \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST http://localhost:5000/admin/switches HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "name": "string",
  "type": "string",
  "description": "string",
  "actuation_force": "string",
  "travel_distance": "string",
  "price": 0,
  "image_url": "string",
  "in_stock": true
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/switches',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post 'http://localhost:5000/admin/switches',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('http://localhost:5000/admin/switches', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:5000/admin/switches', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/switches");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:5000/admin/switches", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /admin/switches`

Создание нового типа свитча для кастомизации клавиатур

> Body parameter

```json
{
  "name": "string",
  "type": "string",
  "description": "string",
  "actuation_force": "string",
  "travel_distance": "string",
  "price": 0,
  "image_url": "string",
  "in_stock": true
}
```

<h3 id="добавление-нового-свитча-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» name|body|string|true|Название свитча|
|» type|body|string|true|Тип свитча (линейные, тактильные, кликающие)|
|» description|body|string|false|Описание свитча|
|» actuation_force|body|string|false|Сила срабатывания (в граммах)|
|» travel_distance|body|string|false|Дистанция хода (в мм)|
|» price|body|number|true|Цена свитча|
|» image_url|body|string|false|URL изображения свитча|
|» in_stock|body|boolean|false|Наличие на складе|

> Example responses

> 201 Response

```json
{
  "id": 0,
  "name": "string",
  "type": "string",
  "description": "string",
  "actuation_force": "string",
  "travel_distance": "string",
  "price": 0.1,
  "image_url": "string",
  "in_stock": true
}
```

<h3 id="добавление-нового-свитча-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Свитч успешно создан|[Switch](#schemaswitch)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Невалидные данные свитча|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Добавление свитча к клавиатуре

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:5000/admin/products/{id}/switches \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST http://localhost:5000/admin/products/{id}/switches HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "switch_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/products/{id}/switches',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post 'http://localhost:5000/admin/products/{id}/switches',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('http://localhost:5000/admin/products/{id}/switches', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:5000/admin/products/{id}/switches', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/products/{id}/switches");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:5000/admin/products/{id}/switches", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /admin/products/{id}/switches`

Привязка свитча к конкретной модели клавиатуры для кастомизации

> Body parameter

```json
{
  "switch_id": 0
}
```

<h3 id="добавление-свитча-к-клавиатуре-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ID клавиатуры|
|body|body|object|true|none|
|» switch_id|body|integer|true|ID свитча для привязки|

> Example responses

> 201 Response

```json
{
  "message": "Свитч успешно добавлен к клавиатуре",
  "product_id": 0,
  "switch_id": 0
}
```

<h3 id="добавление-свитча-к-клавиатуре-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Свитч успешно привязан к клавиатуре|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Невалидные данные или свитч уже привязан|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Клавиатура или свитч не найдены|[Error](#schemaerror)|

<h3 id="добавление-свитча-к-клавиатуре-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» message|string|false|none|none|
|» product_id|integer|false|none|none|
|» switch_id|integer|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Получение всех заказов

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/admin/orders \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET http://localhost:5000/admin/orders HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/orders',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get 'http://localhost:5000/admin/orders',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('http://localhost:5000/admin/orders', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/admin/orders', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/orders");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/admin/orders", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /admin/orders`

Возвращает список всех заказов для администрирования

<h3 id="получение-всех-заказов-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|status|query|string|false|Фильтр по статусу заказа|
|page|query|integer|false|Номер страницы для пагинации|
|limit|query|integer|false|Количество элементов на странице|

#### Enumerated Values

|Parameter|Value|
|---|---|
|status|pending|
|status|processing|
|status|shipped|
|status|delivered|
|status|cancelled|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "user_id": 0,
      "status": "pending",
      "total_amount": 0.1,
      "created_at": "2019-08-24T14:15:22Z",
      "items": [
        {
          "product_name": "string",
          "switch_name": "string",
          "quantity": 0,
          "price": 0
        }
      ],
      "shipping_address": {
        "address": "string",
        "city": "string",
        "postal_code": "string",
        "country": "string"
      }
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 0,
    "total": 0,
    "pages": 0
  }
}
```

<h3 id="получение-всех-заказов-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешное получение списка заказов|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|

<h3 id="получение-всех-заказов-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[[Order](#schemaorder)]|false|none|none|
|»» id|integer|false|none|none|
|»» user_id|integer|false|none|none|
|»» status|string|false|none|none|
|»» total_amount|number(float)|false|none|none|
|»» created_at|string(date-time)|false|none|none|
|»» items|[object]|false|none|none|
|»»» product_name|string|false|none|none|
|»»» switch_name|string|false|none|none|
|»»» quantity|integer|false|none|none|
|»»» price|number|false|none|none|
|»» shipping_address|object|false|none|none|
|»»» address|string|false|none|none|
|»»» city|string|false|none|none|
|»»» postal_code|string|false|none|none|
|»»» country|string|false|none|none|
|» pagination|[Pagination](#schemapagination)|false|none|none|
|»» page|integer|false|none|none|
|»» limit|integer|false|none|none|
|»» total|integer|false|none|none|
|»» pages|integer|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|pending|
|status|processing|
|status|shipped|
|status|delivered|
|status|cancelled|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Изменение статуса заказа

> Code samples

```shell
# You can also use wget
curl -X PUT http://localhost:5000/admin/orders/{id}/status \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
PUT http://localhost:5000/admin/orders/{id}/status HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "status": "pending"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/orders/{id}/status',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.put 'http://localhost:5000/admin/orders/{id}/status',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.put('http://localhost:5000/admin/orders/{id}/status', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('PUT','http://localhost:5000/admin/orders/{id}/status', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/orders/{id}/status");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("PUT");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("PUT", "http://localhost:5000/admin/orders/{id}/status", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`PUT /admin/orders/{id}/status`

Обновление статуса заказа для отслеживания процесса выполнения

> Body parameter

```json
{
  "status": "pending"
}
```

<h3 id="изменение-статуса-заказа-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ID заказа|
|body|body|object|true|none|
|» status|body|string|true|Новый статус заказа|

#### Enumerated Values

|Parameter|Value|
|---|---|
|» status|pending|
|» status|processing|
|» status|shipped|
|» status|delivered|
|» status|cancelled|

> Example responses

> 200 Response

```json
{
  "id": 0,
  "user_id": 0,
  "status": "pending",
  "total_amount": 0.1,
  "created_at": "2019-08-24T14:15:22Z",
  "items": [
    {
      "product_name": "string",
      "switch_name": "string",
      "quantity": 0,
      "price": 0
    }
  ],
  "shipping_address": {
    "address": "string",
    "city": "string",
    "postal_code": "string",
    "country": "string"
  }
}
```

<h3 id="изменение-статуса-заказа-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Статус заказа успешно обновлен|[Order](#schemaorder)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Невалидный статус заказа|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Заказ не найден|[Error](#schemaerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Получение списка пользователей

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/admin/users \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET http://localhost:5000/admin/users HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/admin/users',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get 'http://localhost:5000/admin/users',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('http://localhost:5000/admin/users', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/admin/users', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/admin/users");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/admin/users", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /admin/users`

Возвращает список всех зарегистрированных пользователей

<h3 id="получение-списка-пользователей-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer|false|Номер страницы для пагинации|
|limit|query|integer|false|Количество элементов на странице|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "login": "string",
      "email": "string",
      "name": "string",
      "surname": "string",
      "created_at": "2019-08-24T14:15:22Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 0,
    "total": 0,
    "pages": 0
  }
}
```

<h3 id="получение-списка-пользователей-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешное получение списка пользователей|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация администратора|None|

<h3 id="получение-списка-пользователей-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[object]|false|none|none|
|»» id|integer|false|none|none|
|»» login|string|false|none|none|
|»» email|string|false|none|none|
|»» name|string|false|none|none|
|»» surname|string|false|none|none|
|»» created_at|string(date-time)|false|none|none|
|» pagination|[Pagination](#schemapagination)|false|none|none|
|»» page|integer|false|none|none|
|»» limit|integer|false|none|none|
|»» total|integer|false|none|none|
|»» pages|integer|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="api--products">Products</h1>

Операции с клавиатурами

## Получение детальной информации о клавиатуре

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/api/products/{id} \
  -H 'Accept: application/json'

```

```http
GET http://localhost:5000/api/products/{id} HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:5000/api/products/{id}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:5000/api/products/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:5000/api/products/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/api/products/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/api/products/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/api/products/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/products/{id}`

Возвращает полную информацию о конкретной клавиатуре по её идентификатору

<h3 id="получение-детальной-информации-о-клавиатуре-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ID клавиатуры|

> Example responses

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "price": 0.1,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  },
  "created_at": "2019-08-24T14:15:22Z"
}
```

<h3 id="получение-детальной-информации-о-клавиатуре-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешное получение данных о клавиатуре|[ProductDetail](#schemaproductdetail)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Клавиатура не найдена|[Error](#schemaerror)|

<aside class="success">
This operation does not require authentication
</aside>

## Получение совместимых свитчей для клавиатуры

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/api/products/{id}/switches \
  -H 'Accept: application/json'

```

```http
GET http://localhost:5000/api/products/{id}/switches HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:5000/api/products/{id}/switches',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:5000/api/products/{id}/switches',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:5000/api/products/{id}/switches', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/api/products/{id}/switches', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/api/products/{id}/switches");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/api/products/{id}/switches", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/products/{id}/switches`

Возвращает список свитчей, совместимых с конкретной моделью клавиатуры

<h3 id="получение-совместимых-свитчей-для-клавиатуры-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ID клавиатуры|

> Example responses

> 200 Response

```json
[
  {
    "id": 0,
    "name": "string",
    "type": "string",
    "description": "string",
    "actuation_force": "string",
    "travel_distance": "string",
    "price": 0.1,
    "image_url": "string",
    "in_stock": true
  }
]
```

<h3 id="получение-совместимых-свитчей-для-клавиатуры-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешное получение списка свитчей|Inline|

<h3 id="получение-совместимых-свитчей-для-клавиатуры-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[Switch](#schemaswitch)]|false|none|none|
|» id|integer|false|none|none|
|» name|string|false|none|none|
|» type|string|false|none|none|
|» description|string|false|none|none|
|» actuation_force|string|false|none|none|
|» travel_distance|string|false|none|none|
|» price|number(float)|false|none|none|
|» image_url|string|false|none|none|
|» in_stock|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="api--switches">Switches</h1>

Операции со свитчами

## Получение каталога свитчей

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/api/switches \
  -H 'Accept: application/json'

```

```http
GET http://localhost:5000/api/switches HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:5000/api/switches',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:5000/api/switches',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:5000/api/switches', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/api/switches', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/api/switches");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/api/switches", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/switches`

Возвращает полный список всех доступных свитчей с возможностью фильтрации

<h3 id="получение-каталога-свитчей-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|type|query|string|false|Фильтр по типу свитчей|
|in_stock|query|boolean|false|Фильтр по наличию на складе|
|page|query|integer|false|Номер страницы для пагинации|
|limit|query|integer|false|Количество элементов на странице|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "name": "string",
      "type": "string",
      "description": "string",
      "actuation_force": "string",
      "travel_distance": "string",
      "price": 0.1,
      "image_url": "string",
      "in_stock": true
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 0,
    "total": 0,
    "pages": 0
  }
}
```

<h3 id="получение-каталога-свитчей-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешное получение каталога свитчей|Inline|

<h3 id="получение-каталога-свитчей-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[[Switch](#schemaswitch)]|false|none|none|
|»» id|integer|false|none|none|
|»» name|string|false|none|none|
|»» type|string|false|none|none|
|»» description|string|false|none|none|
|»» actuation_force|string|false|none|none|
|»» travel_distance|string|false|none|none|
|»» price|number(float)|false|none|none|
|»» image_url|string|false|none|none|
|»» in_stock|boolean|false|none|none|
|» pagination|[Pagination](#schemapagination)|false|none|none|
|»» page|integer|false|none|none|
|»» limit|integer|false|none|none|
|»» total|integer|false|none|none|
|»» pages|integer|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="api--orders">Orders</h1>

Операции с заказами

## Создание нового заказа

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:5000/api/orders \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST http://localhost:5000/api/orders HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "items": [
    {
      "product_id": 0,
      "switch_id": 0,
      "quantity": 1
    }
  ],
  "shipping_address": {
    "address": "string",
    "city": "string",
    "postal_code": "string",
    "country": "string"
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/api/orders',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post 'http://localhost:5000/api/orders',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('http://localhost:5000/api/orders', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:5000/api/orders', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/api/orders");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:5000/api/orders", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/orders`

Создание заказа с выбранными товарами и свитчами

> Body parameter

```json
{
  "items": [
    {
      "product_id": 0,
      "switch_id": 0,
      "quantity": 1
    }
  ],
  "shipping_address": {
    "address": "string",
    "city": "string",
    "postal_code": "string",
    "country": "string"
  }
}
```

<h3 id="создание-нового-заказа-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreateOrderRequest](#schemacreateorderrequest)|true|none|

> Example responses

> 201 Response

```json
{
  "id": 0,
  "user_id": 0,
  "status": "pending",
  "total_amount": 0.1,
  "created_at": "2019-08-24T14:15:22Z",
  "items": [
    {
      "product_name": "string",
      "switch_name": "string",
      "quantity": 0,
      "price": 0
    }
  ],
  "shipping_address": {
    "address": "string",
    "city": "string",
    "postal_code": "string",
    "country": "string"
  }
}
```

<h3 id="создание-нового-заказа-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Заказ успешно создан|[Order](#schemaorder)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Невалидные данные заказа|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## Получение истории заказов пользователя

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/api/user/orders \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET http://localhost:5000/api/user/orders HTTP/1.1
Host: localhost:5000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('http://localhost:5000/api/user/orders',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get 'http://localhost:5000/api/user/orders',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('http://localhost:5000/api/user/orders', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/api/user/orders', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/api/user/orders");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/api/user/orders", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/user/orders`

Возвращает список всех заказов текущего авторизованного пользователя

<h3 id="получение-истории-заказов-пользователя-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer|false|none|
|limit|query|integer|false|none|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "user_id": 0,
      "status": "pending",
      "total_amount": 0.1,
      "created_at": "2019-08-24T14:15:22Z",
      "items": [
        {
          "product_name": "string",
          "switch_name": "string",
          "quantity": 0,
          "price": 0
        }
      ],
      "shipping_address": {
        "address": "string",
        "city": "string",
        "postal_code": "string",
        "country": "string"
      }
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 0,
    "total": 0,
    "pages": 0
  }
}
```

<h3 id="получение-истории-заказов-пользователя-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешное получение истории заказов|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Требуется аутентификация|None|

<h3 id="получение-истории-заказов-пользователя-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[[Order](#schemaorder)]|false|none|none|
|»» id|integer|false|none|none|
|»» user_id|integer|false|none|none|
|»» status|string|false|none|none|
|»» total_amount|number(float)|false|none|none|
|»» created_at|string(date-time)|false|none|none|
|»» items|[object]|false|none|none|
|»»» product_name|string|false|none|none|
|»»» switch_name|string|false|none|none|
|»»» quantity|integer|false|none|none|
|»»» price|number|false|none|none|
|»» shipping_address|object|false|none|none|
|»»» address|string|false|none|none|
|»»» city|string|false|none|none|
|»»» postal_code|string|false|none|none|
|»»» country|string|false|none|none|
|» pagination|[Pagination](#schemapagination)|false|none|none|
|»» page|integer|false|none|none|
|»» limit|integer|false|none|none|
|»» total|integer|false|none|none|
|»» pages|integer|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|pending|
|status|processing|
|status|shipped|
|status|delivered|
|status|cancelled|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

<h1 id="api--users">Users</h1>

Операции с пользователями

## Аутентификация пользователя

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:5000/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:5000/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "login": "string",
  "password": "pa$$word"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:5000/login',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:5000/login',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:5000/login', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:5000/login', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/login");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:5000/login", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /login`

Проверка учетных данных пользователя и создание сессии

> Body parameter

```json
{
  "login": "string",
  "password": "pa$$word"
}
```

<h3 id="аутентификация-пользователя-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» login|body|string|true|Логин пользователя|
|» password|body|string(password)|true|Пароль пользователя|

> Example responses

> 200 Response

```json
{
  "message": "Авторизация успешна",
  "user": {
    "id": 0,
    "login": "string",
    "name": "string",
    "surname": "string",
    "email": "string"
  }
}
```

<h3 id="аутентификация-пользователя-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Успешная аутентификация|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Неверный логин или пароль|[Error](#schemaerror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Ошибка сервера|[Error](#schemaerror)|

<h3 id="аутентификация-пользователя-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» message|string|false|none|none|
|» user|object|false|none|none|
|»» id|integer|false|none|ID пользователя|
|»» login|string|false|none|Логин пользователя|
|»» name|string|false|none|Имя пользователя|
|»» surname|string|false|none|Фамилия пользователя|
|»» email|string|false|none|Email пользователя|

<aside class="success">
This operation does not require authentication
</aside>

## Проверка статуса аутентификации

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:5000/check-auth \
  -H 'Accept: application/json' \
  -H 'Authorization: string'

```

```http
GET http://localhost:5000/check-auth HTTP/1.1
Host: localhost:5000
Accept: application/json
Authorization: string

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'string'
};

fetch('http://localhost:5000/check-auth',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'string'
}

result = RestClient.get 'http://localhost:5000/check-auth',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'string'
}

r = requests.get('http://localhost:5000/check-auth', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'string',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:5000/check-auth', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:5000/check-auth");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"string"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:5000/check-auth", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /check-auth`

Проверка валидности токена авторизации и восстановление сессии пользователя

<h3 id="проверка-статуса-аутентификации-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string|true|Токен в формате: логин пользователя|

> Example responses

> 200 Response

```json
{
  "isAuthenticated": true,
  "user": {
    "id": 0,
    "login": "string",
    "name": "string",
    "surname": "string",
    "email": "string"
  }
}
```

<h3 id="проверка-статуса-аутентификации-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Статус аутентификации|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Токен не предоставлен или невалиден|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Ошибка сервера|[Error](#schemaerror)|

<h3 id="проверка-статуса-аутентификации-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» isAuthenticated|boolean|false|none|none|
|» user|object|false|none|none|
|»» id|integer|false|none|ID пользователя|
|»» login|string|false|none|Логин пользователя|
|»» name|string|false|none|Имя пользователя|
|»» surname|string|false|none|Фамилия пользователя|
|»» email|string|false|none|Email пользователя|

Status Code **401**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» isAuthenticated|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_ProductDetail">ProductDetail</h2>
<!-- backwards compatibility -->
<a id="schemaproductdetail"></a>
<a id="schema_ProductDetail"></a>
<a id="tocSproductdetail"></a>
<a id="tocsproductdetail"></a>

```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "price": 0.1,
  "image_url": "string",
  "category": "string",
  "in_stock": true,
  "specifications": {
    "layout": "string",
    "connection_type": "string",
    "battery_life": "string",
    "weight": "string"
  },
  "created_at": "2019-08-24T14:15:22Z"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|name|string|false|none|none|
|description|string|false|none|none|
|price|number(float)|false|none|none|
|image_url|string|false|none|none|
|category|string|false|none|none|
|in_stock|boolean|false|none|none|
|specifications|object|false|none|none|
|» layout|string|false|none|none|
|» connection_type|string|false|none|none|
|» battery_life|string|false|none|none|
|» weight|string|false|none|none|
|created_at|string(date-time)|false|none|none|

<h2 id="tocS_Switch">Switch</h2>
<!-- backwards compatibility -->
<a id="schemaswitch"></a>
<a id="schema_Switch"></a>
<a id="tocSswitch"></a>
<a id="tocsswitch"></a>

```json
{
  "id": 0,
  "name": "string",
  "type": "string",
  "description": "string",
  "actuation_force": "string",
  "travel_distance": "string",
  "price": 0.1,
  "image_url": "string",
  "in_stock": true
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|name|string|false|none|none|
|type|string|false|none|none|
|description|string|false|none|none|
|actuation_force|string|false|none|none|
|travel_distance|string|false|none|none|
|price|number(float)|false|none|none|
|image_url|string|false|none|none|
|in_stock|boolean|false|none|none|

<h2 id="tocS_CreateOrderRequest">CreateOrderRequest</h2>
<!-- backwards compatibility -->
<a id="schemacreateorderrequest"></a>
<a id="schema_CreateOrderRequest"></a>
<a id="tocScreateorderrequest"></a>
<a id="tocscreateorderrequest"></a>

```json
{
  "items": [
    {
      "product_id": 0,
      "switch_id": 0,
      "quantity": 1
    }
  ],
  "shipping_address": {
    "address": "string",
    "city": "string",
    "postal_code": "string",
    "country": "string"
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|items|[object]|true|none|none|
|» product_id|integer|true|none|none|
|» switch_id|integer|false|none|none|
|» quantity|integer|true|none|none|
|shipping_address|object|true|none|none|
|» address|string|true|none|none|
|» city|string|true|none|none|
|» postal_code|string|true|none|none|
|» country|string|true|none|none|

<h2 id="tocS_Order">Order</h2>
<!-- backwards compatibility -->
<a id="schemaorder"></a>
<a id="schema_Order"></a>
<a id="tocSorder"></a>
<a id="tocsorder"></a>

```json
{
  "id": 0,
  "user_id": 0,
  "status": "pending",
  "total_amount": 0.1,
  "created_at": "2019-08-24T14:15:22Z",
  "items": [
    {
      "product_name": "string",
      "switch_name": "string",
      "quantity": 0,
      "price": 0
    }
  ],
  "shipping_address": {
    "address": "string",
    "city": "string",
    "postal_code": "string",
    "country": "string"
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|integer|false|none|none|
|user_id|integer|false|none|none|
|status|string|false|none|none|
|total_amount|number(float)|false|none|none|
|created_at|string(date-time)|false|none|none|
|items|[object]|false|none|none|
|» product_name|string|false|none|none|
|» switch_name|string|false|none|none|
|» quantity|integer|false|none|none|
|» price|number|false|none|none|
|shipping_address|object|false|none|none|
|» address|string|false|none|none|
|» city|string|false|none|none|
|» postal_code|string|false|none|none|
|» country|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|pending|
|status|processing|
|status|shipped|
|status|delivered|
|status|cancelled|

<h2 id="tocS_Pagination">Pagination</h2>
<!-- backwards compatibility -->
<a id="schemapagination"></a>
<a id="schema_Pagination"></a>
<a id="tocSpagination"></a>
<a id="tocspagination"></a>

```json
{
  "page": 0,
  "limit": 0,
  "total": 0,
  "pages": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|page|integer|false|none|none|
|limit|integer|false|none|none|
|total|integer|false|none|none|
|pages|integer|false|none|none|

<h2 id="tocS_Error">Error</h2>
<!-- backwards compatibility -->
<a id="schemaerror"></a>
<a id="schema_Error"></a>
<a id="tocSerror"></a>
<a id="tocserror"></a>

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|object|false|none|none|
|» code|string|false|none|none|
|» message|string|false|none|none|
|» details|object|false|none|none|

