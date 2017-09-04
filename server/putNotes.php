<?php
  try {
    // Create connection
    $conn = new mysqli('localhost', 'bsergent', 'Akr@z!4!5', 'dexter');

    // Get request body as json
    $post = json_decode(file_get_contents('php://input'));

    // Update/insert notes
    foreach ($post as $note) {
      $val = "''";
      switch ($note->type) {
        case 'bool':
        case 'number':
          $val = $note->value;
          break;
        case 'string':
          $val = "'".$note->value."'";
          break;
      }
      // Query
      $sql = "INSERT INTO notes (date, label, type, value_".$note->type.") VALUES ('".$note->date."', '".$note->label."', '".$note->type."', ".$val.")";
      if ($conn->query($sql) === false) {
        // Send error
        header('Content-type: application/json');
        $response = new \stdClass;
        $response->success = false;
        $response->error = $conn->error;
        echo json_encode($response);
        return;
      }
    }
    // Send response
    header('Content-type: application/json');
    $response = new \stdClass;
    $response->success = true;
    echo json_encode($response);
  } catch (Exception $ex) {
    // Send error
    header('Content-type: application/json');
    $response = new \stdClass;
    $response->success = false;
    $response->error = $ex->getMessage();
    echo json_encode($response);
  }
?>