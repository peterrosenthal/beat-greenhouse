<script>
  import * as api from '$lib/api';

  let test = 'waiting';
  api.get('combine', { 'Test-Header': 'testheader' }).then(function (response) {
    console.log(response);
    test = response.test;
  });
</script>

<h1>Test endpoints</h1>
<p>{test}</p>
